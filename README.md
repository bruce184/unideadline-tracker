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
+-- database/            # SQL schema, seed data, ERD notes
+-- scripts/             # Optional helper scripts
+-- .env.example         # Environment variable template
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
| `docs/README_SETUP.md` | Local setup, Supabase setup, env, run commands, demo checklist |
| `docs/API_CONTRACT.md` | API source of truth for frontend/backend integration |
| `docs/DATABASE_SCHEMA.md` | Supabase schema, constraints, indexes, RLS, seed requirements |
| `docs/CODING_GUIDELINES.md` | Branch, commit, PR, code style, security, docs sync rules |
| `docs/DEV_WORKFLOW.md` | Task workflow, role workflow, AI Agent usage, Definition of Done |

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

