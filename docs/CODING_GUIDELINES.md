# CODING GUIDELINES - UniDeadline Tracker

## 1. Purpose

This document defines coding, Git, pull request, review, and AI-assisted development rules for UniDeadline Tracker.

Use it together with:

- `AGENTS.md`
- `docs/agent-context/00-index.md`
- `docs/DEV_WORKFLOW.md`
- `docs/API_CONTRACT.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/README_SETUP.md`
- `docs/implementation/02_task_template.md`
- The assignment sheet

---

## 2. Project Principles

| Principle | Rule |
|---|---|
| MVP first | Implement assigned MVP tasks only |
| Simple over complex | Prefer readable student-MVP code |
| Contract first | API behavior follows `docs/API_CONTRACT.md` |
| Schema first | Database work follows `docs/DATABASE_SCHEMA.md` |
| Local demo first | Do not break `npm run dev` |
| Secure by default | Do not expose `.env`, keys, passwords, or service role key |
| Task-focused PRs | One branch should cover one assigned task/scope |
| Scope lock | Do not fix unrelated issues silently |

---

## 3. Branch Strategy

The project uses a simple branch model:

| Branch pattern | Purpose |
|---|---|
| `main` | Main stable/baseline/demo branch |
| `<member>/<scope>` | Member task branch |
| `fix/<bug-name>` | Bug fix branch if a generic fix branch is clearer |
| `docs/<topic>` | Documentation branch |
| `chore/<topic>` | Setup/config/maintenance branch |

No mandatory `dev` branch is required.

Rules:

1. `main` stores the reviewed stable baseline/demo source.
2. Do not commit directly to `main` unless the project manager approves.
3. Create task branches from latest `main`.
4. Open Pull Requests back into `main`.
5. Keep branch scope aligned with the assignment sheet.

Recommended flow:

```bash
git checkout main
git pull origin main
git checkout -b <member>/<scope>
```

Examples:

```bash
git checkout -b hoang/baseline-repo
git checkout -b khoa/database-schema
git checkout -b quan/deadline-api
git checkout -b thien/deadline-ui
git checkout -b toan/dashboard-reminder
```

---

## 4. Commit Rules

Use Conventional Commit format:

```text
<type>(<scope>): <short description>
```

Examples:

```bash
git commit -m "chore(baseline): initialize project source"
git commit -m "feat(auth): add login page"
git commit -m "feat(deadline): add deadline CRUD API"
git commit -m "fix(course): validate missing course name"
git commit -m "docs(api): update deadline contract"
```

Allowed types:

```text
feat
fix
docs
style
refactor
test
chore
```

Common scopes:

```text
baseline
setup
auth
course
deadline
status
dashboard
reminder
search
api
db
client
server
ui
docs
demo
```

---

## 5. Pull Request Rules

Every PR should include:

- Assignment/task name
- Owner
- Summary of changes
- Files/areas changed
- How to run
- How to test
- Screenshots if UI changed
- Docs updated if API/schema/setup/workflow changed
- Known issues or assumptions

PR target:

```text
base: main
compare: <member>/<scope>
```

---

## 6. Before Push Checklist

Before pushing:

1. Pull latest `main`.
2. Run the part you changed locally.
3. Confirm `.env` and secrets are not staged.
4. Confirm API changes are reflected in `docs/API_CONTRACT.md`.
5. Confirm schema changes are reflected in `docs/DATABASE_SCHEMA.md`.
6. Confirm setup changes are reflected in `docs/README_SETUP.md`.
7. Update the assignment sheet status/note if needed.
8. Record out-of-scope issues instead of fixing them silently.

Useful commands:

```bash
git status
npm run dev
npm run build:client
npm run dev:server
npm run lint --prefix client
```

---

## 7. JavaScript Style

Project language:

```text
JavaScript with ES modules
```

Rules:

- Use `import` and `export`.
- Use `const` by default.
- Use `let` only when reassignment is needed.
- Avoid `var`.
- Use `async/await`.
- Keep functions focused and readable.
- Remove unused variables and temporary console logs before merge.
- Validate inputs before database operations.

Naming:

| Item | Convention | Example |
|---|---|---|
| React component | PascalCase | `DeadlineList.jsx` |
| Hook | camelCase starting with `use` | `useDeadlines.js` |
| Service file | domain service | `deadlineService.js` |
| Utility function | camelCase | `formatDueDate()` |
| Constant | UPPER_SNAKE_CASE | `DEFAULT_PAGE_SIZE` |
| Database field | snake_case | `submission_link` |

---

## 8. Frontend Guidelines

Frontend stack:

- React
- Tailwind CSS
- Vite

Expected structure when needed:

```text
client/src/
+-- components/
+-- pages/
+-- routes/
+-- services/
+-- hooks/
+-- utils/
+-- styles/
+-- assets/
```

Rules:

1. Use functional components.
2. Show loading, empty, error, and success states.
3. Validate required fields before submit.
4. Disable submit buttons while requests are running.
5. Use service functions instead of scattered `fetch` calls.
6. Read API base URL from `VITE_API_BASE_URL`.
7. Use `submission_link` on deadline forms/details for document/submission URL.
8. Use mock data only when API is not ready and mark it clearly.
9. Keep UI responsive for laptop and mobile browser.

---

## 9. Backend Guidelines

Backend stack:

- Node.js
- Express.js
- Supabase

Expected structure when needed:

```text
server/src/
+-- config/
+-- routes/
+-- controllers/
+-- models/
+-- services/       # Optional for complex business logic
+-- middleware/
+-- utils/
+-- index.js
```

Rules:

1. Protect private endpoints with auth middleware.
2. Validate request body and query params.
3. Never trust `user_id` from request body.
4. Set `user_id` from authenticated Supabase user.
5. Enforce ownership for courses, deadlines, reminders.
6. Return response shapes from `docs/API_CONTRACT.md`.
7. Use stable error codes from `docs/API_CONTRACT.md`.
8. Do not add separate link/upload endpoints in MVP.
9. Keep Supabase/Auth data access in `models/`; controllers must not query Supabase directly.

---

## 10. Database and Supabase Rules

Database source of truth:

```text
docs/DATABASE_SCHEMA.md
```

Rules:

1. Use Supabase PostgreSQL.
2. Use Supabase Auth.
3. Core MVP tables: `profiles`, `courses`, `deadlines`, `reminders`.
4. Store document/submission URL in `deadlines.submission_link`.
5. Use RLS for app tables.
6. Do not commit Supabase service role key.
7. Do not use real private student data in seed/demo data.

---

## 11. Security Rules

Never commit:

- `.env`
- API keys
- Supabase service role key
- Passwords
- Personal tokens
- Real user data
- Private credentials

Allowed to commit:

- `.env.example`
- Fake placeholder values
- Public setup instructions
- Fake demo seed data

---

## 12. Local Verification

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

Health check:

```text
http://localhost:3001/api/v1/health
```

---

## 13. MVP Boundary

Do not implement unless approved:

- Group collaboration
- Group task assignment
- Native mobile app
- Full LMS/Outlook production integration
- Long-term AI risk prediction
- Advanced admin analytics
- File upload storage API
- Multiple deadline links or `deadline_links` table/API

---

## 14. AI Agent Rules

When using an AI Agent:

1. Provide the assigned row from the assignment sheet.
2. Ask the Agent to read `AGENTS.md`.
3. Ask the Agent to read `docs/agent-context/00-index.md`.
4. Provide `docs/DEV_WORKFLOW.md`.
5. Use `docs/implementation/02_task_template.md` for non-trivial tasks.
6. Provide API/schema/setup docs when relevant.
7. Ask the Agent to implement only the assigned task.
8. Require a final report with changed files, run steps, test steps, docs updated, assumptions, blockers, and out-of-scope issues.

Agent must not:

- Add unrelated features, screens, endpoints, tables, packages, or architecture changes.
- Change API/schema silently.
- Modify unrelated files just because it sees an issue.
- Commit secrets or real data.
- Delete team work without confirmation.

If the Agent finds an issue outside the assigned task, record it in:

```text
docs/implementation/handoff/issues_backlog.md
```

The Agent must not:

- Add unrelated features.
- Change API/schema silently.
- Commit secrets.
- Remove user/team work without confirmation.

---

## 15. Definition of Done

A task is done when:

1. The assigned requirement is completed.
2. The change stays within MVP scope.
3. Relevant verification was run or blocker is documented.
4. API/schema/setup docs are updated if needed.
5. No secret/private data is committed.
6. Assignment sheet status/note is updated.
