# Prompt Role - Dev Feature

Use this prompt for assigned feature/module implementation.

## Read First

Always read:

```text
docs/prompts/01-common-rules.md
AGENTS.md
docs/agent-context/00-index.md
docs/DEV_WORKFLOW.md
docs/CODING_GUIDELINES.md
```

Then read by area:

| Area | Required docs |
|---|---|
| Backend/API | `docs/API_CONTRACT.md`, `docs/DATABASE_SCHEMA.md`, `docs/agent-context/05-data-api-contract.md`, `docs/agent-context/07-security-supabase.md` |
| Frontend/UI | `docs/API_CONTRACT.md`, `docs/agent-context/06-ui-design.md` |
| Database/Supabase | `docs/DATABASE_SCHEMA.md`, `docs/README_SETUP.md`, `docs/agent-context/07-security-supabase.md` |
| Setup/demo/docs | `docs/README_SETUP.md`, `docs/DEV_WORKFLOW.md` |

## Phase 1 - Inspect And Propose

Before coding:

1. Inspect local branch and worktree.
2. Read the relevant assignment row.
3. Locate existing files for the assigned module.
4. Identify whether the module already exists in local code or only in docs.
5. Infer the file scope from role, assignment row, repo structure, and docs.
6. Present a short technical proposal.

Proposal format:

```text
Current local state:
Assigned scope:
Files likely to change:
User flow or API flow:
Data/API/schema impact:
Verification plan:
Assumptions/blockers:
```

If the member asked for immediate implementation and the scope is clear, proceed
after this concise safety check. If scope is unclear, stop and ask.

## Phase 2 - Implement

Follow the layer boundary for the assigned area.

Backend/API:

- Route -> controller/handler -> service/repository if the structure exists.
- Validate body and query params.
- Authenticate protected endpoints.
- Enforce user ownership.
- Return the standard API response shape.
- Do not trust `user_id` from request bodies.

Frontend/UI:

- Use React functional components.
- Use service functions for API calls when reusable.
- Read API base URL from `VITE_API_BASE_URL`.
- Include loading, error, empty, success, and validation states when relevant.
- Keep laptop and mobile widths usable.

Database/Supabase:

- Keep SQL in `database/`.
- Use fake demo data only.
- Include constraints, indexes, triggers, and RLS when assigned.
- Do not commit real project keys.

## Phase 3 - Verify

Run only relevant checks. If a command exceeds the CLI timeout rule, stop and
ask the member to run it.

Common checks:

```bash
node --check server/src/index.js
npm.cmd run lint --prefix client
npm.cmd run build --prefix client
```

For API/database tasks, include manual API or Supabase SQL/RLS notes.

## Phase 4 - Report

Use the standard completion report. Include any source-of-truth mismatch as an
assumption, blocker, or out-of-scope issue.
