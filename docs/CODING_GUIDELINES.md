# CODING GUIDELINES - UniDeadline Tracker

## 1. Purpose

This file defines coding, Git, commit, branch, and pull request rules for UniDeadline Tracker.

All members should follow these rules to keep the project consistent and easy to review.

## 2. Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable demo/submission branch |
| `dev` | Integration branch |
| `feat/*` | New features |
| `fix/*` | Bug fixes |
| `docs/*` | Documentation |
| `chore/*` | Setup/config tasks |

Rules:

- Do not commit directly to `main`.
- Team members create feature branches from `dev`.
- Pull Requests should target `dev`.
- Merge to `main` only when the build is stable and ready for demo/submission.

## 3. Common Branch Names

Examples:

```bash
feat/auth
feat/course-management
feat/deadline-crud
feat/weekly-dashboard
feat/reminder
feat/search-filter
fix/login-validation
fix/deadline-status
docs/api-contract
chore/project-setup
```

## 4. Conventional Commit

Use Conventional Commit format:

```text
<type>(<scope>): <short description>
```

Examples:

```bash
git commit -m "feat(auth): add login page"
git commit -m "fix(deadline): validate missing due date"
git commit -m "docs(readme): add local setup guide"
git commit -m "refactor(api): separate deadline service logic"
git commit -m "test(dashboard): add weekly dashboard test checklist"
```

## 5. Commit Types

| Type | Meaning |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting only, no logic change |
| `refactor` | Code restructuring |
| `test` | Test/checklist |
| `chore` | Config/package/setup |

## 6. Common Scopes

| Scope | Meaning |
|---|---|
| `auth` | Login/register/session |
| `course` | Course management |
| `deadline` | Deadline CRUD |
| `status` | Deadline status logic |
| `dashboard` | Weekly dashboard |
| `reminder` | Reminder setting/notification |
| `search` | Search/filter |
| `api` | Backend API |
| `ui` | Frontend UI |
| `db` | Database schema |
| `docs` | Documentation |
| `setup` | Project setup |

## 7. Before Push Checklist

Before pushing code:

1. Pull latest `dev`.
2. Run the part you changed locally.
3. Do not commit `.env` or secret keys.
4. Keep commits small and related to one task.
5. Update docs if API/schema changes.
6. Update Checklist status if task progress changes.
7. Create Pull Request into `dev`.

## 8. Pull Request Checklist

A Pull Request should include:

- Task ID
- Module
- What changed
- How to test
- Screenshots if UI changed
- Notes about API/schema changes
- Known issues if any

Example PR description:

```text
Task ID: BE-003
Module: Deadline
Summary:
- Added create deadline endpoint
- Added validation for title, course_id, due_date
- Added user ownership check

How to test:
1. Run server locally.
2. Send POST /api/v1/deadlines with valid body.
3. Check response and Supabase data.

Notes:
- API contract updated.
```

## 9. Frontend Guidelines

Frontend stack:

- React
- Tailwind CSS
- Vite

Rules:

- Keep components small and readable.
- Avoid hard-coded mock data after API is ready.
- Use loading and error states.
- Keep UI responsive for laptop and mobile browser.
- Validate required form fields before submit.
- Show clear error messages.

Suggested folder structure:

```text
client/src/
├── components/
├── pages/
├── routes/
├── services/
├── hooks/
├── utils/
└── styles/
```

## 10. Backend Guidelines

Backend stack:

- Node.js
- Express.js
- Supabase

Rules:

- Keep routes, controllers, and services separated when project grows.
- Validate request body before database operation.
- Return standard response format.
- Protect private endpoints with auth middleware.
- Ensure users can only access their own data.
- Update API contract when endpoint behavior changes.

Suggested folder structure:

```text
server/src/
├── config/
├── routes/
├── controllers/
├── services/
├── middleware/
├── utils/
└── index.js
```

## 11. API Response Rule

Success response:

```json
{
  "ok": true,
  "data": {},
  "message": "Success"
}
```

Error response:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input"
  }
}
```

## 12. Security Rules

Do not commit:

- `.env`
- Supabase service role key
- API keys
- Passwords
- Real user data

Always check `.gitignore` before committing.

## 13. MVP Scope Rule

Do not implement these in MVP unless approved:

- Group collaboration
- Group task assignment
- Native mobile app
- Full LMS/Outlook production integration
- Long-term AI risk prediction
- Advanced admin analytics

## 14. Recommended Workflow

```bash
git checkout dev
git pull origin dev

git checkout -b feat/<task-name>

# code here

git status
git add .
git commit -m "feat(scope): short description"
git push -u origin feat/<task-name>
```

Then open Pull Request:

```text
base: dev
compare: feat/<task-name>
```