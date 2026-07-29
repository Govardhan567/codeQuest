# Tasks — CodeQuest

Actionable backlog, broken out from the sprint plan. Check items off as completed. Each task should be small enough to finish in one sitting.

---

## Sprint 1 — Foundation
- [ ] Create Supabase project, note API keys/URL
- [ ] Design and run initial SQL migration (profiles, languages, topics, problems, submissions, achievements, user_achievements)
- [ ] Enable Row Level Security on `profiles`, `submissions`, `user_achievements`
- [ ] Write RLS policies (user can only read/write their own rows)
- [ ] Scaffold NestJS project (`nest new backend`)
- [ ] Add Supabase client + auth guard middleware in NestJS
- [ ] Build `/auth/signup` endpoint
- [ ] Build `/auth/login` endpoint
- [ ] Build `/auth/reset-password` (request + confirm) endpoints
- [ ] Frontend: scaffold Next.js app, Tailwind setup
- [ ] Frontend: login page
- [ ] Frontend: signup page
- [ ] Frontend: forgot-password / reset-password pages
- [ ] End-to-end test: signup → email verify → login → reset password

## Sprint 2 — Learning Hub
- [ ] Seed `languages` table (Java, Python, JavaScript, SQL, C, C++)
- [ ] Seed `topics` table with ordered lesson content (start with 1 language, e.g. Python)
- [ ] Build `/lessons/:language` list endpoint
- [ ] Build `/lessons/:language/:topic` detail endpoint
- [ ] Frontend: language picker page
- [ ] Frontend: topic list page (sidebar navigation)
- [ ] Frontend: lesson content renderer (markdown → HTML)
- [ ] Frontend: "Try it yourself" embedded live code editor (no grading, just run/print output)
- [ ] Add end-of-topic mini quiz (MCQ) with instant feedback

## Sprint 3 — Practice Arena
- [ ] Design XP formula (points per quiz, per streak day, per practice session)
- [ ] Build streak tracking logic (daily check-in, resets on missed day)
- [ ] Build hearts/lives system (decrement on wrong answer, regenerate over time)
- [ ] Build `/practice/session` endpoint (returns adaptive set of exercises)
- [ ] Add "weak topic" tracking (resurface topics with low quiz accuracy)
- [ ] Frontend: practice session UI (progress bar, hearts, streak flame)
- [ ] Frontend: XP/level display on profile

## Sprint 4 — Challenge Zone
- [ ] Seed `problems` table with initial problem set + test cases (start with 10–15 per language)
- [ ] Integrate code execution sandbox (Judge0 or Piston API)
- [ ] Build `/submissions` endpoint (submit code → run against test cases → store result)
- [ ] Build submission history endpoint
- [ ] Frontend: Monaco Editor integration
- [ ] Frontend: problem list page with difficulty/language filters
- [ ] Frontend: problem detail + editor + run/submit buttons
- [ ] Frontend: show pass/fail per test case, runtime stats
- [ ] Add rate limiting on submissions (prevent spam/abuse)

## Sprint 5 — AI Hint Agent
- [ ] Write and test system prompt (see agent.md)
- [ ] Build `AiHintService` in NestJS (calls LLM API)
- [ ] Track help-request count per student per problem (drives escalation level)
- [ ] Build `/hints/:problemId` endpoint
- [ ] Frontend: hint chat panel next to editor
- [ ] Add per-day hint rate limit per problem
- [ ] Log hint interactions for analytics

## Sprint 6 — Gamification
- [ ] Finalize XP-to-level mapping table
- [ ] Seed `achievements` table (streak badges, milestone badges, language-mastery badges)
- [ ] Build achievement-unlock trigger logic (Postgres function or NestJS service)
- [ ] Build leaderboard query (global, per-language, weekly/monthly)
- [ ] Frontend: achievements page (earned + locked badges)
- [ ] Frontend: leaderboard page
- [ ] Frontend: roadmap tier visual (Basic → Intermediate → Advanced → Professional) with current position highlighted

## Sprint 7 — Polish & Launch
- [ ] Responsive layout pass (mobile/tablet)
- [ ] Dark mode toggle
- [ ] Admin panel: add/edit lessons, problems, achievements
- [ ] Error/loading states across all pages
- [ ] Deploy frontend (Vercel)
- [ ] Deploy backend (Railway/Render)
- [ ] Connect production Supabase project, run migrations
- [ ] Smoke-test full user journey: signup → lesson → practice → challenge → hint → achievement unlock

---

## Backlog (unscheduled / stretch goals)
- [ ] Mock technical interview mode
- [ ] Classroom/teacher mode
- [ ] Completion certificates per roadmap tier
- [ ] Mobile app (React Native)
