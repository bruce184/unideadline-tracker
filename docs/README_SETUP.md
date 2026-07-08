# README SETUP - UniDeadline Tracker

## 1. Purpose

This file explains how to set up, run, verify, and demo UniDeadline Tracker locally.

Use this file when:

- A new team member clones the repository.
- A baseline owner prepares the source for the team.
- A developer runs frontend/backend locally.
- An AI Agent needs setup context.

---

## 2. Project Summary

UniDeadline Tracker is a responsive web app for students to manage courses, deadlines, submission status, weekly dashboard, reminders, and submission links.

Local demo is required. Online deployment is optional.

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

MVP link decision:

- Store document/submission URL in `deadlines.submission_link`.
- Do not create a separate `deadline_links` table/API in MVP.

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Tailwind CSS + Vite |
| Backend | Node.js + Express.js |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Version control | Git + GitHub |
| Package manager | npm |

Local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3001/api/v1
Health:   http://localhost:3001/api/v1/health
```

---

## 4. Prerequisites

Install:

- Node.js 18 or newer
- npm
- Git
- VS Code
- Supabase account

Check versions:

```bash
node -v
npm -v
git --version
```

---

## 5. Clone and Branch Setup

Clone repository:

```bash
git clone https://github.com/bruce184/unideadline-tracker.git
cd unideadline-tracker
```

Use `main` as the stable/baseline/demo branch:

```bash
git checkout main
git pull origin main
```

Create a task branch:

```bash
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

No mandatory `dev` branch is required.

---

## 6. Repository Structure

```text
unideadline-tracker/
+-- client/              # React + Tailwind + Vite frontend
+-- server/              # Node.js + Express backend
+-- docs/                # Project documents for team and AI Agents
+-- docs/agent-context/  # Short context files for AI Agents
+-- docs/implementation/ # Scope-lock rules, task template, handoff notes
+-- database/            # SQL schema, seed data, ERD notes
+-- scripts/             # Optional helper scripts
+-- .env.example         # Environment variable template
+-- AGENTS.md            # Root AI Agent instructions
+-- README.md            # Project overview
+-- package.json         # Root scripts
```

Docs:

| File | Purpose |
|---|---|
| `AGENTS.md` | Root Agent rules and strict scope guardrails |
| `docs/agent-context/00-index.md` | Agent context reading guide |
| `docs/README_SETUP.md` | Local setup and demo guide |
| `docs/API_CONTRACT.md` | API source of truth |
| `docs/DATABASE_SCHEMA.md` | Supabase schema/RLS source of truth |
| `docs/CODING_GUIDELINES.md` | Code, Git, PR, security rules |
| `docs/DEV_WORKFLOW.md` | Task workflow and AI Agent usage |
| `docs/implementation/02_task_template.md` | Task prompt template for devs and Agents |

---

## 7. Install Dependencies

From root:

```bash
npm run install:all
```

If root dependencies are missing:

```bash
npm install
npm run install:all
```

Do not commit `node_modules/`.

---

## 8. Environment Setup

Create:

```text
client/.env
server/.env
```

Do not commit real `.env` files.

Frontend `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Backend `server/.env`:

```env
PORT=3001
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GEMINI_API_KEY=your_google_ai_studio_api_key_here

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3001/api/v1/gmail/callback
GOOGLE_OAUTH_STATE_SECRET=your_random_oauth_state_secret

EMAIL_REMINDER_ENABLED=false
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
EMAIL_REMINDER_TRIGGER_TOKEN=
```

Security:

- `SUPABASE_SERVICE_ROLE_KEY` stays server-side only.
- Never put service role key in `client/.env`.

---

## 9. Supabase Setup

Create Supabase project.

Recommended security options:

```text
[x] Enable Data API
[ ] Automatically expose new tables
[x] Enable automatic RLS
```

For the local MVP registration flow, configure Supabase Auth under
`Authentication -> Providers -> Email`:

```text
[ ] Confirm email
```

The current UI signs in immediately after signup. If email confirmation is
enabled, signup succeeds but the user must confirm the email before login.

Current registration form rules:

- `display_name` is required and limited to 120 characters.
- Password must contain at least 8 characters, one uppercase letter, and one
  number.
- A special character is not required for the MVP.

Supabase may enforce additional password requirements configured for the
project. Keep those settings compatible with the registration form.

Collect:

```text
Project URL
Anon public key
Service role key
```

Use them in `client/.env` and `server/.env`.

---

## 10. Database Setup

Baseline setup should create:

```text
database/schema.sql
database/seed.sql
```

Schema must follow:

```text
docs/DATABASE_SCHEMA.md
```

MVP tables:

```text
profiles
courses
deadlines
reminders
gmail_connections
friendships
group_projects
group_project_members
group_tasks
```

Do not create in MVP:

```text
deadline_links
file_uploads
projects
```

Run schema SQL in Supabase SQL Editor.

If a local Supabase project already has the older reminder configuration schema
with `reminders.offsets` or `reminders.enabled`, reset the demo database or drop
and recreate `public.reminders` before rerunning `database/schema.sql`. The MVP
schema now stores one reminder row per scheduled `reminder_time`.

---

## 11. Seed Data

Minimum demo data:

| Data | Minimum |
|---|---:|
| Demo account | 1 |
| Courses | 5 |
| Deadlines | 20 |
| Pending reminder rows | 15 |
| Deadlines with reminder rows | 5 |
| Deadlines with `submission_link` | 8 |

Seed data should include:

- Due today
- Due this week
- Due next week
- Overdue
- Submitted
- High, Medium, Low priority
- With and without pending reminders
- With and without `submission_link`

Use fake demo data only.

---

## 12. Run Project Locally

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

Lint frontend:

```bash
npm run lint --prefix client
```

---

## 13. Verify Local Setup

Backend health:

```text
http://localhost:3001/api/v1/health
```

Expected:

```json
{
  "ok": true,
  "data": {
    "service": "server",
    "status": "running",
    "timestamp": "2026-06-10T08:00:00.000Z"
  },
  "message": "UniDeadline Tracker API is running"
}
```

Frontend:

```text
http://localhost:5173
```

Expected:

- App loads without blank screen.
- Browser console has no blocking runtime error.
- API calls use `VITE_API_BASE_URL`.

Supabase:

- Auth project exists.
- Required tables exist.
- RLS is enabled.
- Demo account/data exists when seed is prepared.

---

## 14. Local Demo Checklist

```text
[ ] Frontend runs at http://localhost:5173
[ ] Backend runs at http://localhost:3001
[ ] Health endpoint works
[ ] Supabase Auth works
[ ] Demo account can log in
[ ] Courses are visible
[ ] Deadlines are visible
[ ] Weekly dashboard has useful data
[ ] Status update works
[ ] Search/filter works
[ ] Reminder UI/data is visible
[ ] Gmail integration page can show status/import flow when env is configured
[ ] Friends/groups page can create owner-managed project tasks
[ ] Deadline submission link is visible/clickable when present
[ ] Mobile width is usable
```

AI/Gmail demo prerequisites:

- `GEMINI_API_KEY` must be set for AI Suggestions chat and Gmail deadline parsing.
- Use a Google AI Studio Gemini API key for `GEMINI_API_KEY` (it normally starts with `AIza`).
- Google OAuth redirect URI must exactly match `http://localhost:3001/api/v1/gmail/callback`.
- The demo user must have at least one course before importing from Gmail.
- The Gmail Integrations page requires selecting the target course before import.
- The Gmail inbox should contain at least one recent email with an explicit deadline, for example "Assignment 2 is due on July 20, 2026 at 23:59".
- Gmail import attaches new deadlines to the selected course and skips duplicate Gmail messages.

Recommended demo flow:

```text
1. Login with demo account
2. View weekly dashboard
3. Create course
4. Create deadline
5. Add or edit submission_link
6. Update status
7. Filter/search deadlines
8. Show reminder/near-due alert
9. Open Gmail Integrations, select a target course, and import deadlines if Gmail env is configured
10. Show friends/groups owner-managed project tracking
11. Open submission link
12. Show responsive layout
```

---

## 15. Common Problems

### `npm run install:all` fails

Check:

```bash
node -v
npm -v
npm install
npm run install:all
```

### Backend port already in use

Change `PORT` in `server/.env` or stop the process using port `3001`.

If backend port changes, update:

```text
client/.env
```

### Frontend cannot call backend

Check:

- Backend is running.
- `VITE_API_BASE_URL` is correct.
- `CLIENT_ORIGIN` is correct.
- Backend route matches `docs/API_CONTRACT.md`.

### Supabase auth fails

Check:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Auth provider settings
- Redirect URLs if using hosted auth flow

### Database request returns no data

Check:

- Tables exist.
- Seed data exists.
- RLS policies allow current user.
- Rows belong to logged-in user.

---

## 16. Baseline Owner Checklist

```text
[ ] Root package scripts work
[ ] client/ runs with Vite
[ ] server/ runs with Express
[ ] .env.example has required placeholders
[ ] client/.env and server/.env are documented but not committed
[ ] docs/ contains required 5 project docs
[ ] database/schema.sql is created from DATABASE_SCHEMA.md
[ ] database/seed.sql is created for demo data
[ ] Backend health endpoint matches API_CONTRACT.md
[ ] main branch is ready
[ ] Baseline tag is created
```

Suggested baseline commands:

```bash
git branch -M main
git add .
git commit -m "chore(baseline): initialize project source"
git push -u origin main
git tag baseline-2026-06-10
git push origin baseline-2026-06-10
```

---

## 17. Security Rules

Never commit:

- `.env`
- API keys
- Supabase service role key
- Passwords
- Personal tokens
- Real user data
- Private credentials

Before commit:

```bash
git status
git diff --cached
```
