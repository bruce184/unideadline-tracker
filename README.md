# UniDeadline Tracker

UniDeadline Tracker is a responsive web app that helps university students manage courses, academic deadlines, submission status, weekly workload, reminders, and submission links in one place.

The project is built as a student MVP with a local-demo-first strategy. Online deployment is optional if the core demo is stable.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Tailwind CSS + Vite |
| Backend | Node.js + Express.js |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Version control | Git + GitHub |

## MVP Scope

The MVP includes:

- Auth / User Account
- Course Management
- Deadline Management
- Submission Status Tracking
- Weekly Dashboard
- Reminder & Priority
- Search & Filter
- Responsive Web App
- Basic In-app Reminder
- Submission Link Storage

Out-of-scope unless approved:

- Group collaboration
- Native mobile app
- Full LMS/Outlook production integration
- Long-term AI risk prediction
- Advanced admin analytics
- File upload storage API
- Multiple links / `deadline_links` table

## Repository Structure

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

## Quick Start

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

Local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3001/api/v1
Health:   http://localhost:3001/api/v1/health
```

For complete setup, Supabase configuration, environment variables, seed data, and troubleshooting, read:

```text
docs/README_SETUP.md
```

## Environment

Create local env files from `.env.example`:

```text
client/.env
server/.env
```

Do not commit real `.env` files.

Frontend uses:

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Backend uses:

```env
PORT=3001
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

`SUPABASE_SERVICE_ROLE_KEY` must stay server-side only.

## Project Documents

| File | Purpose |
|---|---|
| `AGENTS.md` | Root instructions and strict rules for AI Agents |
| `docs/agent-context/00-index.md` | Reading guide for Agent context files |
| `docs/README_SETUP.md` | Local setup, Supabase setup, env, run commands, demo checklist |
| `docs/API_CONTRACT.md` | API source of truth for frontend/backend integration |
| `docs/DATABASE_SCHEMA.md` | Supabase schema, constraints, indexes, RLS, seed requirements |
| `docs/CODING_GUIDELINES.md` | Branch, commit, PR, code style, security, docs sync rules |
| `docs/DEV_WORKFLOW.md` | Task workflow, role workflow, AI Agent usage, Definition of Done |
| `docs/implementation/02_task_template.md` | Copy/paste task template for team members and AI Agents |
| `docs/implementation/handoff/issues_backlog.md` | Out-of-scope issues found during development |

## AI Agent Workflow

Before giving a task to an AI Agent, include the task row from the assignment sheet and ask it to read:

```text
AGENTS.md
docs/agent-context/00-index.md
docs/DEV_WORKFLOW.md
docs/CODING_GUIDELINES.md
```

Use this template for assigned tasks:

```text
docs/implementation/02_task_template.md
```

Agent rules:

- Implement only the assigned task.
- Do not add unrelated screens, endpoints, tables, packages, or architecture changes.
- Do not change API/schema silently.
- If an issue is outside scope, report it instead of fixing it silently.
- Never commit `.env`, Supabase service role keys, tokens, passwords, or real user data.

## Development Workflow

Use `main` as the stable/baseline/demo branch.

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

Open a Pull Request into `main`.

No mandatory `dev` branch is required.

## MVP Data Note

Document/submission URL is stored directly in:

```text
deadlines.submission_link
```

Do not create a separate `deadline_links` table/API in MVP.

## Security Rules

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
