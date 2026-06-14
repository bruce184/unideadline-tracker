# Prompt Role - Code Review

Use this prompt when reviewing local changes, a branch, or a PR.

## Read First

```text
docs/prompts/01-common-rules.md
AGENTS.md
docs/agent-context/00-index.md
docs/DEV_WORKFLOW.md
docs/CODING_GUIDELINES.md
```

Read API/schema/UI docs as needed for the changed files.

## Review Focus

Prioritize findings over summary:

1. Bugs and behavioral regressions.
2. Security and ownership issues.
3. API contract or schema mismatch.
4. Missing validation or error handling.
5. Missing loading/error/empty states.
6. Missing or insufficient verification.
7. Scope drift outside the assignment row.

## UniDeadline-Specific Checks

- Backend must not trust `user_id` from request bodies.
- Private data must be scoped to the authenticated Supabase user.
- `deadlines.submission_link` is the MVP link field.
- Do not add `deadline_links`, upload APIs, or multiple-link APIs.
- API responses must match `docs/API_CONTRACT.md`.
- Schema changes must match `docs/DATABASE_SCHEMA.md`.
- Frontend must use configured API base URL.
- Secrets and `.env` files must not be staged.

## Output Format

List findings first, ordered by severity:

```text
Findings:
- [P1] File:line - issue and impact
- [P2] File:line - issue and impact

Open questions:

Test gaps:

Summary:
```

If there are no findings, say that clearly and mention remaining test gaps or
residual risk.
