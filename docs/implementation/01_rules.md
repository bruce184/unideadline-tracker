# Implementation Rules

## 1. Scope Lock

Each task must stay inside the assigned feature, files, or area.

Do not modify unrelated files just because an issue is visible. Record out-of-scope issues in the completion report or backlog.

## 2. Small Commits

Use one commit per completed task when practical.

Commit format:

```text
feat(scope): short description
fix(scope): short description
docs(scope): short description
chore(scope): short description
```

## 3. Branch Rule

Start from `main`:

```bash
git checkout main
git pull origin main
git checkout -b <member>/<scope>
```

Open PR into `main`.

## 4. Verification Gate

Run checks relevant to the change:

```bash
npm run build:client
node --check server/src/index.js
```

For API/database tasks, include manual API or Supabase verification notes.

If a command cannot be run, explain why in the completion report.

## 5. No Silent Contract Changes

Do not change API endpoints, response shapes, table fields, enum values, RLS policies, or environment variables without updating the matching source-of-truth doc.

## 6. Security Gate

Before committing:

1. Confirm `.env` files are not staged.
2. Confirm no Supabase service role key is staged.
3. Confirm seed data is fake.
4. Confirm no real user data is committed.

## 7. Acceptance Criteria

Every assigned task should define acceptance criteria. A task is done only when each criterion is met or a blocker is clearly documented.

## 8. Handoff

After completing a task, report:

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
