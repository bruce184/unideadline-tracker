# Prompt Role - Refactor

Use this prompt only when the member explicitly asks for refactoring.

## Read First

```text
docs/prompts/01-common-rules.md
AGENTS.md
docs/agent-context/00-index.md
docs/DEV_WORKFLOW.md
docs/CODING_GUIDELINES.md
docs/agent-context/02-project-structure.md
docs/agent-context/03-architecture.md
```

## Phase 1 - Plan And Safety Check

Before editing:

1. Inspect local repo state.
2. Identify the exact target file/module.
3. Confirm the expected behavior must stay the same.
4. List files that may change.
5. List files that must not change.
6. Identify tests/checks to run.

If the refactor would change API contract, database schema, user-facing behavior,
or another member's scope, stop and ask.

## Phase 2 - Refactor

- Keep behavior unchanged unless explicitly requested.
- Keep file moves small.
- Update imports.
- Preserve public API shapes unless the task explicitly allows changing them.
- Do not combine refactor with feature work.

## Phase 3 - Verify

Run relevant checks. For frontend, build/lint if practical. For backend, run
syntax checks. Respect the CLI timeout rule.

## Phase 4 - Report

Include:

```text
Behavior preserved:
Files changed:
Checks run:
Residual risk:
```

Use the standard completion report.
