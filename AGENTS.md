# Agent Instructions - UniDeadline Tracker

This repository is a student MVP for UniDeadline Tracker, a responsive web app for managing university courses, deadlines, submission status, weekly workload, reminders, and submission links.

## Tech Stack

- Frontend: React + Tailwind CSS + Vite
- Backend: Node.js + Express.js
- Database: Supabase PostgreSQL
- Authentication: Supabase Auth
- Version control: Git + GitHub

## Read Before Coding

For any non-trivial task, read these files first:

1. `docs/agent-context/00-index.md`
2. `docs/DEV_WORKFLOW.md`
3. `docs/CODING_GUIDELINES.md`
4. `docs/API_CONTRACT.md` if the task touches API, frontend integration, or backend routes
5. `docs/DATABASE_SCHEMA.md` if the task touches database, Supabase, RLS, seed data, or backend queries
6. `docs/README_SETUP.md` if the task touches setup, env, run commands, or Supabase configuration

## Strict Rules

1. Implement only the assigned task.
2. Do not add features outside MVP scope.
3. Do not add tables, endpoints, screens, packages, or architecture changes unless the assigned task explicitly requires them.
4. Do not silently change API contract or database schema.
5. Do not trust `user_id` from request bodies. Use the authenticated Supabase user.
6. Store the MVP document/submission URL in `deadlines.submission_link`.
7. Do not create `deadline_links`, multiple-link APIs, or file upload APIs in MVP.
8. Do not commit secrets, `.env` files, Supabase service role keys, tokens, passwords, or real user data.
9. Do not rewrite existing architecture without approval.
10. Keep changes small and focused.
11. If behavior is unclear, document assumptions or ask before changing scope.
12. If you find an issue outside the assigned task, record it in the completion report or `docs/implementation/handoff/issues_backlog.md`; do not fix it silently.

## Common Commands

```bash
npm run install:all
npm run dev
npm run build:client
```

Backend health check:

```text
http://localhost:3001/api/v1/health
```

## Completion Report

Every task must end with:

```text
Summary:
Files changed:
How to run:
How to test:
Docs updated:
Assumptions:
Blockers:
Out-of-scope issues found:
```
