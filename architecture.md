# Architecture — CodeQuest

System-level view of how the pieces fit together. Read this alongside `decisions.md` (why choices were made), `agent.md` (AI hint agent contract), and `tasks.md` (build order).

---

## 1. High-Level System Diagram

```
                              ┌─────────────────────────┐
                              │        Browser           │
                              │  Next.js Frontend (React) │
                              └────────────┬─────────────┘
                                           │ HTTPS (REST + WS)
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
        ┌────────────────────┐  ┌───────────────────┐  ┌────────────────────┐
        │   Supabase Auth     │  │   NestJS Backend    │  │  Supabase Realtime  │
        │ (signup/login/reset)│  │  (business logic)   │  │  (leaderboard push) │
        └──────────┬──────────┘  └─────────┬──────────┘  └──────────┬─────────┘
                   │                       │                        │
                   │                       ▼                        │
                   │           ┌──────────────────────┐              │
                   │           │  Code Execution API   │              │
                   │           │  (Judge0 / Piston)     │              │
                   │           └──────────────────────┘              │
                   │                       │                        │
                   │                       ▼                        │
                   │           ┌──────────────────────┐              │
                   │           │     AI Hint Agent      │              │
                   │           │   (LLM API call)       │              │
                   │           └──────────────────────┘              │
                   │                                                 │
                   └───────────────────────┬─────────────────────────┘
                                           ▼
                              ┌─────────────────────────┐
                              │   Supabase Postgres DB    │
                              │ (RLS-protected tables)     │
                              └─────────────────────────┘
```

---

## 2. Component Responsibilities

| Component | Responsibility |
|---|---|
| **Next.js Frontend** | Renders UI (lessons, practice, challenges, leaderboard, auth pages); calls Supabase client directly for auth session state; calls NestJS REST API for all business logic |
| **Supabase Auth** | Handles signup, login, JWT issuance, password reset emails, email verification |
| **NestJS Backend** | Owns business logic: XP/level calculation, streak logic, achievement unlocking, submission grading orchestration, AI hint orchestration; verifies Supabase JWT on every protected route |
| **Supabase Postgres (+ RLS)** | Source of truth for all persistent data; Row Level Security enforces that a user can only touch their own rows even if called directly from the frontend |
| **Code Execution API** | Sandboxed runner for Java/Python/JS/C/C++/SQL submissions; returns pass/fail per test case, runtime, memory, stderr |
| **AI Hint Agent** | NestJS service that assembles context (code, test results, help-count) and calls the LLM, enforcing the escalation rules in `agent.md` |
| **Supabase Realtime** | Pushes leaderboard/XP updates to connected clients without polling |

---

## 3. Request Flow Examples

### 3.1 Login
1. Frontend calls `supabase.auth.signInWithPassword()` directly (no NestJS involved).
2. Supabase returns a JWT + refresh token; frontend stores session.
3. Every subsequent call to the NestJS API includes the JWT in the `Authorization` header.
4. NestJS `AuthGuard` verifies the JWT against Supabase's public key before allowing the request to reach a controller.

### 3.2 Submitting a Challenge Solution
1. Frontend sends `{ problemId, code, language }` to `POST /submissions`.
2. NestJS `SubmissionsController` validates the JWT, fetches the problem's test cases from Postgres.
3. `SubmissionsService` sends code + test cases to the Code Execution API.
4. Execution API returns per-test-case results.
5. `SubmissionsService` writes the result row to `submissions`, updates XP/streak via `UsersService`, checks `AchievementsService` for newly-unlocked badges.
6. Response returned to frontend: pass/fail per test, XP gained, any new badge.
7. If a badge was unlocked, a Realtime event updates the leaderboard for other connected clients.

### 3.3 Requesting an AI Hint
1. Frontend sends `{ problemId, code, lastTestResult }` to `POST /hints/:problemId`.
2. NestJS `AiHintService` looks up the student's help-request count for this problem in this session (from a `hint_requests` table or in-memory/Redis counter).
3. Service builds the system prompt (see `agent.md` §5), sets escalation level from the count.
4. Calls the LLM API, returns the response to the frontend.
5. Increments the help-request counter; logs the interaction (student_id, problem_id, level, timestamp) for analytics.

### 3.4 Password Reset
1. Frontend calls `supabase.auth.resetPasswordForEmail(email)` directly.
2. Supabase sends the reset email with a magic link.
3. User clicks link → lands on `/auth/reset-password` page with a recovery token in the URL.
4. Frontend calls `supabase.auth.updateUser({ password })` to finalize — no NestJS involvement needed for this flow.

---

## 4. NestJS Module Breakdown

```
AppModule
├── AuthModule        — JWT verification guard, auth-related utility endpoints
├── UsersModule       — profile, XP, level, streak, hearts logic
├── LessonsModule     — topic/lesson CRUD (read-heavy, mostly served from Postgres)
├── ProblemsModule    — problem CRUD, test case storage
├── SubmissionsModule — orchestrates code execution + grading + XP updates
├── AiHintModule      — AI hint agent service + rate limiting
├── AchievementsModule— badge unlock rules, leaderboard queries
└── AdminModule       — content management (lessons/problems/achievements) — admin role only
```

Each module follows standard NestJS layering: `Controller` (HTTP routes) → `Service` (business logic) → `Repository/Supabase client` (data access).

---

## 5. Data Flow: XP & Leveling

```
Quiz answered correctly ─┐
Practice session done ───┼──▶ UsersService.addXp(userId, amount)
Challenge solved ────────┘           │
                                      ▼
                        Update profiles.xp in Postgres
                                      │
                                      ▼
                    Recalculate level from XP thresholds
                                      │
                                      ▼
                AchievementsService.checkUnlocks(userId)
                                      │
                                      ▼
                 New badge? → insert into user_achievements
                                      │
                                      ▼
                  Realtime broadcast → leaderboard updates
```

---

## 6. Security Architecture

- **Auth**: All session/token issuance handled by Supabase Auth — NestJS never touches raw passwords.
- **Authorization**: NestJS `AuthGuard` verifies JWT signature + expiry on every protected route; role checks (`student` vs `admin`) via a `RolesGuard`.
- **Row Level Security**: Even if the frontend calls Supabase directly (e.g., for auth state), RLS policies ensure a user can only read/write rows where `user_id = auth.uid()`.
- **Code execution isolation**: Student code never runs in the NestJS process — always delegated to the sandboxed Judge0/Piston service with strict time/memory limits.
- **AI hint agent**: Only receives the current problem's code/context — no access to other users' data, no filesystem or network tool access from the LLM's side.
- **Rate limiting**: Applied at the NestJS gateway level for `/submissions` (prevent grading-spam) and `/hints/:problemId` (control LLM API cost).

---

## 7. Deployment Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   Vercel      │      │  Railway/Render    │      │  Supabase Cloud    │
│  (Next.js)    │◀────▶│   (NestJS API)     │◀────▶│ (Postgres + Auth)  │
└─────────────┘      └──────────────────┘      └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Judge0/Piston     │
                    │  (self-hosted or    │
                    │   hosted API)       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   LLM API (hint     │
                    │   agent provider)    │
                    └──────────────────┘
```

- Frontend and backend deployed independently so either can scale/redeploy without the other.
- Environment variables (Supabase URL/keys, LLM API key, Judge0 endpoint) injected per environment (dev/staging/prod) — never committed to the repo.

---

## 8. Key Non-Functional Considerations
- **Scalability**: Stateless NestJS instances behind a load balancer; session/auth state lives in Supabase, not in-process, so horizontal scaling is straightforward.
- **Cost control**: LLM hint calls and code-execution calls are the main variable costs — both are rate-limited per user per problem/day (see `agent.md` §6).
- **Latency**: Code execution and AI hints are the slowest operations — both should show a loading state on the frontend rather than blocking the UI thread.
- **Data integrity**: All XP/streak/achievement mutations happen server-side in NestJS, never trusted from the client, to prevent XP/score tampering.
