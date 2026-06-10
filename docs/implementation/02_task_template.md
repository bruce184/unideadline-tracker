# Task Template for Team Members and AI Agents

Copy this template when assigning work to a developer or AI Agent.

```text
You are working in the UniDeadline Tracker repository.

Read first:
- AGENTS.md
- docs/agent-context/00-index.md
- docs/DEV_WORKFLOW.md
- docs/CODING_GUIDELINES.md

Task information:
- Feature group:
- Feature/task:
- Owner:
- Status:
- Priority:
- Deadline:
- Output expected:
- Allowed files/area:
- Related docs:
- Notes:

Scope lock:
- Implement only this task.
- Do not add unrelated features, screens, endpoints, tables, packages, or architecture changes.
- If API changes are required, update docs/API_CONTRACT.md.
- If database changes are required, update docs/DATABASE_SCHEMA.md.
- If setup changes are required, update docs/README_SETUP.md.
- If behavior is unclear, list assumptions before coding.
- If you find an issue outside scope, report it instead of fixing it silently.

Acceptance criteria:
- [ ]
- [ ]
- [ ]

Verification required:
- [ ] npm run build:client, if frontend changed
- [ ] node --check server/src/index.js, if backend changed
- [ ] Manual API test notes, if API changed
- [ ] Supabase SQL/RLS verification notes, if database changed

Completion report format:
Summary:
Files changed:
How to run:
How to test:
Docs updated:
Assumptions:
Blockers:
Out-of-scope issues found:
```

## Minimal Prompt for Small Tasks

```text
Read AGENTS.md and docs/DEV_WORKFLOW.md first.
Complete only this assigned task:

<paste assignment row>

Follow docs/API_CONTRACT.md if the task touches API.
Follow docs/DATABASE_SCHEMA.md if the task touches database.
Do not add features outside MVP.
Report changed files, tests, assumptions, blockers, and out-of-scope issues.
```
