# Agent Prompt Router - UniDeadline Tracker

Use this file as the parent prompt for AI Agents working on UniDeadline Tracker.
It routes the Agent to the right role prompt while keeping the work tied to the
member's local repository state and assigned scope.

Prompt role files are workflow guides only. They do not replace the source of
truth docs:

- `AGENTS.md`
- `docs/agent-context/00-index.md`
- `docs/DEV_WORKFLOW.md`
- `docs/CODING_GUIDELINES.md`
- `docs/API_CONTRACT.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/README_SETUP.md`

## Required First Steps

Before proposing or coding, the Agent must:

1. Inspect the member's local repository state:

```bash
git status --short --branch
git branch --show-current
git log --oneline --max-count=5
```

2. Read the common rules:

```text
docs/prompts/01-common-rules.md
```

3. Read the required project docs:

```text
AGENTS.md
docs/agent-context/00-index.md
docs/DEV_WORKFLOW.md
docs/CODING_GUIDELINES.md
```

4. Read the assignment row from the team assignment sheet when provided.

Current team sheet, when available on this PC:

```text
D:\1.UMT\1.SUBJECTS\3.JUNIOR\SEM9\SOFTWARE PROJECT MANAGEMENT\UniDeadline Tracker - Bảng Phân Công.xlsx
```

If the path differs on another member's PC, ask the member for the local path or
paste/export of the relevant row.

## Route By Work Type

Choose exactly one primary role prompt:

| Work type | Prompt |
|---|---|
| New feature or assigned module work | `docs/prompts/02-dev-feature.md` |
| Bug fix | `docs/prompts/03-bugfix.md` |
| Refactor | `docs/prompts/04-refactor.md` |
| Code review or PR review | `docs/prompts/05-code-review.md` |
| QA, UAT, local demo, verification | `docs/prompts/06-qa-demo.md` |

If the task spans multiple work types, choose the smallest primary prompt that
matches the user's explicit request. Do not combine workflows unless the user
asks for a combined task.

## Scope Classification

Use the assignment row and current local repo to infer the primary area:

| Assignment area | Normal scope |
|---|---|
| Backend/API | `server/src/`, API docs only if contract changes |
| Frontend/UI | `client/src/`, UI docs only if behavior/design rules change |
| Database/Supabase | `database/`, `docs/DATABASE_SCHEMA.md` |
| API client/service layer | `client/src/services/` or local equivalent |
| Docs/setup/demo | `docs/`, `README.md`, setup/demo files |

The assignment sheet is ownership and module-scope context, not a complete
technical spec. Infer allowed files from the assignment row, role prompt, repo
structure, and source-of-truth docs.

If inferred scope is ambiguous, overlaps another member's assignment, or would
require changing API/schema outside the assigned task, stop and ask the member
before coding.

## Router Output

Before implementation, state briefly:

```text
Local branch:
Local repo state:
Assigned row:
Chosen prompt:
Inferred scope:
Required docs:
Assumptions or blockers:
```

For simple review/QA tasks, this can be concise. For implementation tasks, this
acts as the safety check before touching files.
