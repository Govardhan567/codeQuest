# Decisions — CodeQuest

Log of key architecture/technical decisions. Add a new entry any time a choice is made that a future contributor (or AI coding assistant) would otherwise have to re-derive or might get wrong.

Format: **Date — Decision — Why — Alternatives considered**

---

### D-001 — Backend framework: NestJS
- **Why**: Opinionated structure (modules/controllers/services) scales better than raw Express for a multi-feature platform (auth, lessons, problems, submissions, AI hints, achievements). Built-in DI makes it easy to swap the AI provider or code-execution provider later.
- **Alternatives considered**: Express (too unstructured at this scope), Fastify standalone (less ecosystem for guards/interceptors).

### D-002 — Database & Auth: Supabase
- **Why**: Postgres + Auth + Row Level Security out of the box removes the need to hand-roll JWT/session logic and password-reset email flows. Realtime subscriptions double as the leaderboard update mechanism.
- **Alternatives considered**: Firebase (NoSQL, worse fit for relational problem/submission data), custom Postgres + Passport.js (more work, no gain).

### D-003 — Code execution: sandboxed API (Judge0 / Piston), not in-process eval
- **Why**: Running untrusted student code in-process is a security risk (arbitrary code execution on our server). A sandboxed judge API isolates execution per language and enforces time/memory limits.
- **Alternatives considered**: Docker-per-submission (viable but more infra to manage early on); native `eval`/`exec` (rejected — unsafe).

### D-004 — AI hint agent: hint-first, escalating disclosure
- **Why**: The point of the platform is learning, not auto-completion. An agent that hands out full solutions on the first ask undermines the product's purpose and its Duolingo/LeetCode-style value.
- **Escalation order**: nudge → targeted hint → pseudocode → full solution (only after repeated explicit requests).
- **Alternatives considered**: Direct solution-on-request (rejected — defeats learning goal); no AI agent at all (rejected — core differentiator).

### D-005 — Editor: Monaco Editor (not CodeMirror)
- **Why**: Same editor engine as VS Code — familiar to students, strong multi-language syntax highlighting, easy React integration.
- **Alternatives considered**: CodeMirror 6 (lighter, but less polished multi-language IntelliSense out of the box).

### D-006 — Gamification model: XP + tiered roadmap, not pure streak-only
- **Why**: A single XP number mapped to tiers (Basic → Intermediate → Advanced → Professional) gives a clear long-term goal, on top of daily streak mechanics for short-term retention.
- **Alternatives considered**: Streak-only (Duolingo-style, but no sense of overall mastery); pure problem-count (LeetCode-style, but ignores lesson/quiz engagement).

### D-007 — Row Level Security is mandatory on all user-linked tables
- **Why**: Every table referencing `profiles.id` (submissions, user_achievements, etc.) must have RLS policies restricting reads/writes to the owning user. This is non-negotiable since Supabase's client SDK can be called directly from the frontend.

---

## Open decisions (not yet finalized)
- [ ] Self-host Judge0 vs. use a hosted judge API (cost vs. control tradeoff)
- [ ] Which LLM provider powers the AI hint agent, and how hint-history is stored/rate-limited per user
- [ ] Whether classroom/teacher mode ships in v1 or is a post-launch stretch goal
