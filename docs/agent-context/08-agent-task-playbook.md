# Agent Task Playbook

## Before Starting

1. Read `AGENTS.md`.
2. Read `docs/agent-context/00-index.md`.
3. Read the assigned task row.
4. Read the source-of-truth docs for the task type.
5. Identify allowed files or allowed area.
6. List assumptions before coding if the task is unclear.

## When Implementing a Frontend Task

1. Locate the target page/component.
2. Confirm API shape in `docs/API_CONTRACT.md`.
3. Add or update service calls if needed.
4. Implement form/UI state.
5. Handle loading, error, empty, validation, and responsive states.
6. Run the relevant local checks.

## When Implementing a Backend/API Task

1. Confirm endpoint path, method, auth, request, and response in `docs/API_CONTRACT.md`.
2. Validate input.
3. Authenticate user.
4. Enforce ownership.
5. Query Supabase using schema from `docs/DATABASE_SCHEMA.md`.
6. Return the standard response format.
7. Test success and failure cases.

## When Implementing a Database/Supabase Task

1. Follow `docs/DATABASE_SCHEMA.md`.
2. Create or update SQL in `database/`.
3. Include constraints, indexes, and RLS.
4. Use fake seed data only.
5. Verify SQL can run in Supabase SQL Editor.

## When Fixing a Bug

1. Identify the feature and layer.
2. Reproduce or describe the bug.
3. Fix the root cause within scope.
4. Avoid broad refactors.
5. Add a test or manual verification note.

## When Refactoring

1. Refactor only if the assignment requires it.
2. Do not change behavior unless requested.
3. Keep file moves small.
4. Update imports and docs if structure changes.

## Build and Verification Gate

Run the checks relevant to the changed area:

```bash
npm run build:client
node --check server/src/index.js
```

If a check cannot be run, report why.

## Completion Report

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
