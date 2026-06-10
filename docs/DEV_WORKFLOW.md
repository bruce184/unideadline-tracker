# DEV WORKFLOW - UniDeadline Tracker

## 1. Purpose

This file is the main workflow guide for team members and AI Agents working on UniDeadline Tracker.

It explains how to:

- Read the right documents
- Pick up assigned tasks
- Create branches
- Implement within MVP scope
- Verify locally
- Report completion
- Avoid AI Agent scope drift

---

## 2. Project Context

| Item | Value |
|---|---|
| Project name | UniDeadline Tracker |
| Product type | Responsive web app |
| Main users | University students |
| Main goal | Manage courses, deadlines, status, weekly dashboard, reminders, and submission links |
| Demo strategy | Local demo required; online deploy optional |
| Stable branch | `main` |

MVP modules:

```text
Auth / User Account
Course Management
Deadline Management
Submission Status Tracking
Weekly Dashboard
Reminder & Priority
Search & Filter
Responsive Web App
Basic In-app Reminder
Submission Link Storage
```

---

## 3. Required Docs

| File | Purpose |
|---|---|
| `AGENTS.md` | Root rules for AI Agents |
| `docs/agent-context/00-index.md` | Agent reading guide |
| `docs/README_SETUP.md` | Local setup, Supabase setup, env, run commands, troubleshooting |
| `docs/API_CONTRACT.md` | API source of truth |
| `docs/DATABASE_SCHEMA.md` | Database schema and RLS source of truth |
| `docs/CODING_GUIDELINES.md` | Code, branch, commit, PR, security rules |
| `docs/implementation/02_task_template.md` | Copy/paste task template for devs and Agents |
| `docs/implementation/handoff/issues_backlog.md` | Out-of-scope issues found during work |

Reading order:

| Task type | Required reading |
|---|---|
| Any task | Assignment row, `AGENTS.md`, `docs/agent-context/00-index.md`, this file |
| Setup/local run | `README_SETUP.md`, `CODING_GUIDELINES.md` |
| Frontend | `agent-context/06-ui-design.md`, `API_CONTRACT.md`, `CODING_GUIDELINES.md` |
| Backend/API | `agent-context/05-data-api-contract.md`, `API_CONTRACT.md`, `DATABASE_SCHEMA.md` |
| Database/Supabase | `agent-context/07-security-supabase.md`, `DATABASE_SCHEMA.md`, `README_SETUP.md` |
| Demo/QA | `README_SETUP.md`, `API_CONTRACT.md`, assignment sheet |
| AI Agent task | `AGENTS.md`, `agent-context/08-agent-task-playbook.md`, `implementation/02_task_template.md` |

---

## 4. Assignment Task Input

Each task should come from the assignment sheet.

Minimum fields:

```text
Feature group:
Feature/task:
Owner:
Status:
Output expected:
Priority:
Deadline:
Notes:
Allowed files/area:
Acceptance criteria:
Verification required:
```

Status values:

```text
Not started
In progress
Review
Done
Blocked
```

Priority values:

```text
Must
Should
Could
```

If the assignment sheet uses Vietnamese labels, map them to the same meaning.

---

## 5. Standard Development Flow

1. Read the assigned row.
2. Read the relevant docs.
3. Pull latest `main`.
4. Create a branch using `<member>/<scope>`.
5. Implement only the assigned scope.
6. Run relevant local verification.
7. Update docs if API/schema/setup/workflow changed.
8. Update assignment sheet status/note.
9. Push branch.
10. Open Pull Request into `main`.

Commands:

```bash
git checkout main
git pull origin main
git checkout -b <member>/<scope>
```

After implementation:

```bash
git status
git add .
git commit -m "feat(scope): short description"
git push -u origin <member>/<scope>
```

Pull Request:

```text
base: main
compare: <member>/<scope>
```

No mandatory `dev` branch is required.

---

## 6. Branch Examples

```bash
git checkout -b hoang/baseline-repo
git checkout -b khoa/database-schema
git checkout -b quan/deadline-api
git checkout -b thien/deadline-ui
git checkout -b toan/dashboard-reminder
```

---

## 7. Local Run Commands

Install dependencies:

```bash
npm run install:all
```

Run frontend and backend:

```bash
npm run dev
```

Run frontend only:

```bash
npm run dev:client
```

Run backend only:

```bash
npm run dev:server
```

Build frontend:

```bash
npm run build:client
```

Backend syntax check:

```bash
node --check server/src/index.js
```

Local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3001/api/v1
Health:   http://localhost:3001/api/v1/health
```

---

## 8. MVP Scope Control

Allowed MVP:

```text
Auth / User Account
Course Management
Deadline Management
Submission Status Tracking
Weekly Dashboard
Reminder & Priority
Search & Filter
Responsive Web App
Basic In-app Reminder
Submission Link Storage
```

Could-have if core MVP is stable:

```text
Email Reminder
Import PoC
Rule-based Priority Suggestion
Dark Mode
```

Out of scope unless approved:

```text
Group collaboration
Native mobile app
Full LMS/Outlook production integration
Long-term AI risk prediction
Advanced admin analytics
File upload storage API
Multiple links / deadline_links table
```

MVP link decision:

```text
Use deadlines.submission_link.
Do not create deadline_links in MVP.
```

---

## 9. Agent Scope Lock

Every AI Agent task must include:

```text
Assigned task:
Allowed files/area:
Expected output:
Acceptance criteria:
Required docs:
Verification required:
```

Agent must not:

- Add unrelated features.
- Add screens/endpoints/tables/packages outside the assigned task.
- Change API/schema silently.
- Modify unrelated files.
- Commit secrets.
- Delete user/team work without confirmation.
- Fix out-of-scope issues silently.

If the Agent finds an issue outside the assigned task, it must report the issue or add it to:

```text
docs/implementation/handoff/issues_backlog.md
```

---

## 10. Backend/API Task Workflow

Backend tasks usually include:

```text
Route
Controller/handler
Validation
Supabase query
Auth/ownership check
Standard response format
Error handling
Manual API test notes
```

Rules:

1. Protect private endpoints.
2. Validate request body and query params.
3. Never trust `user_id` from request body.
4. Set `user_id` from authenticated user.
5. Ensure users access only their own data.
6. Return response format from `API_CONTRACT.md`.
7. Keep database usage aligned with `DATABASE_SCHEMA.md`.
8. Use `deadlines.submission_link` for document/submission URL.
9. Do not add separate link/upload endpoints in MVP.

Minimum verification:

```text
1. Valid request succeeds.
2. Missing token returns 401.
3. Invalid body returns 400.
4. Missing/inaccessible resource returns 404.
5. Response shape matches API contract.
```

---

## 11. Frontend/UI Task Workflow

Frontend tasks usually include:

```text
Page/component
Form state
Validation
API service call
Loading state
Error state
Empty state
Responsive layout
Manual UI test notes
```

Rules:

1. Keep UI simple and demo-friendly.
2. Validate required fields before submit.
3. Show validation and API error messages.
4. Use service functions for API calls when logic is reused.
5. Read API base URL from `VITE_API_BASE_URL`.
6. Use deadline `submission_link` in deadline form/detail.
7. Do not add unrelated screens.

Minimum verification:

```text
1. Page renders.
2. Main action works.
3. Required validation appears.
4. Loading/error/empty states are handled.
5. Laptop and mobile widths are usable.
```

---

## 12. Database/Supabase Workflow

Database tasks usually include:

```text
database/schema.sql
database/seed.sql
RLS policy notes
Seed data notes
Backend impact notes
```

Rules:

1. Follow `DATABASE_SCHEMA.md`.
2. Core MVP tables are `profiles`, `courses`, `deadlines`, `reminders`.
3. Use `deadlines.submission_link`.
4. Enable RLS.
5. Use fake demo data only.
6. Do not commit real Supabase keys.

Minimum verification:

```text
1. Tables can be created.
2. Constraints exist.
3. RLS policies exist.
4. Seed data uses valid enum values.
5. Backend can query required data.
```

---

## 13. QA / Testing Workflow

Required coverage:

| Area | Minimum test |
|---|---|
| Auth | Login/session behavior |
| Course | Create, list, update, blocked delete if deadlines exist |
| Deadline | Create, list, detail, update, delete |
| Status | Not Started, In Progress, Submitted, Overdue |
| Dashboard | Weekly list and summary counts |
| Reminder | Enable/disable in-app reminders |
| Search/filter | Course/status/priority/date/search filters |
| Submission link | Add/edit/open `submission_link` in deadline |
| Responsive UI | Laptop and mobile browser |

---

## 14. Documentation Workflow

Update docs when:

| Change | Required update |
|---|---|
| Endpoint, request, response, validation, error | `API_CONTRACT.md` |
| Table, field, index, trigger, RLS, seed requirement | `DATABASE_SCHEMA.md` |
| Install/run/env/Supabase setup | `README_SETUP.md` |
| Branch/commit/PR/coding workflow | `CODING_GUIDELINES.md` or this file |
| Agent instructions or scope lock | `AGENTS.md` or `docs/agent-context/` |
| Task owner/status/output | Assignment sheet |

---

## 15. AI Agent Prompt

Use the full template in:

```text
docs/implementation/02_task_template.md
```

Minimal prompt:

```text
Read AGENTS.md and docs/DEV_WORKFLOW.md first.
Complete only this assigned task:

<paste assignment row>

Follow docs/API_CONTRACT.md if the task touches API.
Follow docs/DATABASE_SCHEMA.md if the task touches database.
Do not add features outside MVP.
Report changed files, tests, assumptions, blockers, and out-of-scope issues.
```

---

## 16. Required Completion Report

After finishing a task, report:

```text
Summary:
Files changed:
Implementation notes:
How to run:
How to test:
Docs updated:
Assignment sheet update:
Assumptions:
Blockers:
Out-of-scope issues found:
```

---

## 17. Definition of Done

A task is done only when:

1. Assigned requirement is completed.
2. Change stays inside MVP scope.
3. Relevant verification is done or blocker is documented.
4. API/schema/setup docs are updated if needed.
5. No secret/private data is committed.
6. Assignment sheet status/note is updated.
7. PR is ready for review or task is clearly blocked.
