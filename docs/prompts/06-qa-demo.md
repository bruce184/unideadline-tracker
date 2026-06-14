# Prompt Role - QA And Demo Verification

Use this prompt for local verification, UAT, demo rehearsal, and release checks.

## Read First

```text
docs/prompts/01-common-rules.md
AGENTS.md
docs/agent-context/00-index.md
docs/DEV_WORKFLOW.md
docs/README_SETUP.md
docs/API_CONTRACT.md
docs/DATABASE_SCHEMA.md
```

## Local State First

Inspect the member's local branch and worktree. Do not assume GitHub `main`
matches the member's local demo state.

## QA Scope

Use the assignment row or member request to choose the smallest relevant QA set.

Common checks:

| Area | Minimum check |
|---|---|
| Setup | Env files documented, no secrets staged |
| Backend | Health endpoint works |
| Auth | Login/session behavior if implemented locally |
| Course | Create/list/update/delete behavior if implemented locally |
| Deadline | Create/list/detail/update/delete behavior if implemented locally |
| Dashboard | Weekly counts, overdue, high priority if implemented locally |
| Search/filter | AND logic and no-result state if implemented locally |
| Reminder | In-app alerts exclude Submitted if implemented locally |
| Submission link | `submission_link` displays/opens if implemented locally |
| Responsive UI | Laptop and mobile width if frontend is implemented locally |

If a feature is required by docs but not implemented in local code yet, report it
as "not implemented locally", not as a failed runtime test.

## Command Rules

Use targeted commands. Do not leave dev servers running indefinitely. If a
command runs longer than about 30 seconds, ask the member to run it and paste
the output.

Useful commands:

```bash
node --check server/src/index.js
npm.cmd run lint --prefix client
npm.cmd run build --prefix client
```

## Output

Report:

```text
Local branch:
Implemented areas observed:
Checks run:
Pass:
Fail:
Not implemented locally:
Commands needing member run:
Blockers:
Recommended next task:
```
