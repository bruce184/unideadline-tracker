# Prompt Role - Bugfix

Use this prompt when the member reports a bug, error, broken flow, or failed
check.

## Read First

```text
docs/prompts/01-common-rules.md
AGENTS.md
docs/agent-context/00-index.md
docs/DEV_WORKFLOW.md
docs/CODING_GUIDELINES.md
```

Read area docs based on the bug location:

- API/backend: `docs/API_CONTRACT.md`, `docs/DATABASE_SCHEMA.md`
- Frontend/UI: `docs/API_CONTRACT.md`, `docs/agent-context/06-ui-design.md`
- Database/Supabase: `docs/DATABASE_SCHEMA.md`, `docs/agent-context/07-security-supabase.md`

## Phase 1 - Investigate

1. Inspect local repo state.
2. Read the error/log/reproduction steps from the member.
3. Locate the smallest relevant code area.
4. Compare behavior against source-of-truth docs.
5. Identify root cause and blast radius.

Report before coding if the fix could affect API contract, schema, unrelated
modules, or another member's scope.

## Phase 2 - Fix

- Fix the root cause, not just a workaround.
- Keep behavior changes limited to the bug.
- Do not use empty `catch` blocks or hide errors silently.
- Preserve local uncommitted member work.
- Do not refactor broadly unless needed for the fix.

## Phase 3 - Verify

Run the smallest relevant checks. Ask the member to run long or blocked commands
per the CLI timeout rule.

Include:

```text
Reproduction:
Root cause:
Fix:
Verification:
Regression risk:
```

## Phase 4 - Report

Use the standard completion report. If the bug revealed a larger out-of-scope
issue, record it instead of fixing it silently.
