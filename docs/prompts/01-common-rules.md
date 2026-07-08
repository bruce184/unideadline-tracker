# Common Agent Rules

These rules apply to every UniDeadline Tracker prompt role.

## Local Repo Is Current State

Treat the member's local repository as the current implementation source.

- Do not assume GitHub `main` is newer or authoritative unless the user asks to
  fetch, pull, push, or inspect GitHub.
- Inspect the current branch and working tree before changing files.
- If the local repo has staged or unstaged changes, read them and work with
  them. Do not overwrite, revert, or delete member work unless explicitly asked.
- Distinguish between "docs say this is required" and "local code currently
  implements this".

## Source Of Truth

Prompt files define how to work. They are not product or API truth.

Use these docs for actual behavior:

- API behavior: `docs/API_CONTRACT.md`
- Database/schema/RLS: `docs/DATABASE_SCHEMA.md`
- Setup/env/run commands: `docs/README_SETUP.md`
- Branch/commit/security: `docs/CODING_GUIDELINES.md`
- Workflow/scope/reporting: `docs/DEV_WORKFLOW.md`
- MVP boundaries: `AGENTS.md` and `docs/agent-context/04-feature-scope.md`

If source-of-truth docs conflict with local code, report the mismatch. Do not
silently rewrite broad areas to make everything match.

Known current caveat: API contract and the latest database reminder schema may
not be fully aligned. If a task touches reminder API/schema behavior, report the
mismatch and ask for confirmation unless the task explicitly asks to resolve it.

## Assignment Sheet Scope

The team assignment sheet is module ownership context.

It may include only:

- Feature group
- Feature/task
- Member
- Status
- Output description
- Priority
- Deadline
- Notes

It is not required to include allowed files, acceptance criteria, or verification
commands. Infer those from the role prompt, local repo structure, and source-of-
truth docs.

If inference is unclear or overlaps another member's module, stop and ask.

## MVP And Security Locks

Do not add unless explicitly assigned and documented:

- New tables outside MVP
- New endpoints outside `docs/API_CONTRACT.md`
- New screens outside assigned UI scope
- New packages or architecture changes
- File upload APIs
- Multiple link APIs
- `deadline_links`
- Real-time multi-user collaboration
- Cross-account group member permissions
- Native mobile app features

Never commit:

- `.env`
- Supabase service role key
- API keys
- tokens
- passwords
- real private user data

Use `deadlines.submission_link` for the MVP document/submission URL.

Never trust `user_id` from request bodies. Backend code must use the
authenticated Supabase user.

## CLI Timeout Rule

For any CLI command in any workflow:

- If it runs longer than about 30 seconds, times out, hangs, or waits for
  interactive input, stop retrying.
- Report the exact command.
- Ask the member to run it locally and paste the output.
- Do not loop on long-running commands.
- Do not start dev servers indefinitely unless the task explicitly requires it.

Completion reports should include:

```text
Commands needing member run:
- <command>
Reason:
- Timed out after 30s / interactive / long-running dev server / local env issue
```

Windows note: if PowerShell blocks `npm` because of execution policy, try
`npm.cmd` once. If it still fails, ask the member to run the command.

## Documentation Sync

Update docs in the same task only when the assigned change requires it:

- API change -> `docs/API_CONTRACT.md`
- Schema/RLS/seed change -> `docs/DATABASE_SCHEMA.md`
- Setup/env/run change -> `docs/README_SETUP.md`
- Workflow/prompt rule change -> `docs/DEV_WORKFLOW.md`, `docs/prompts/`, or
  `docs/CODING_GUIDELINES.md`

If a related issue is outside scope, record it in the completion report or
`docs/implementation/handoff/issues_backlog.md`.

## Completion Report

Every task ends with:

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
