# README SETUP - UniDeadline Tracker

## 1. Purpose

This file explains how to set up and run UniDeadline Tracker locally for development and demo.

UniDeadline Tracker is a responsive web app for students to manage courses, deadlines, submission status, weekly dashboard, reminders, and basic search/filter.

## 2. Tech Stack

- Frontend: React + Tailwind CSS
- Backend: Node.js + Express.js
- Database: Supabase PostgreSQL
- Authentication: Supabase Auth
- Version Control: GitHub
- Demo Strategy: Local demo first, online deployment if time allows

## 3. Requirements

Before running the project, install:

- Node.js 18 or newer
- npm
- Git
- VS Code
- Supabase project account

Check versions:

```bash
node -v
npm -v
git --version
```

## 4. Clone Repository

```bash
git clone https://github.com/bruce184/unideadline-tracker.git
cd unideadline-tracker
```

Switch to the development branch:

```bash
git checkout dev
git pull origin dev
```

## 5. Install Dependencies

From the root folder:

```bash
npm run install:all
```

This command installs dependencies for both:

- `client/`
- `server/`

## 6. Environment Setup

Copy `.env.example` and create real environment files when needed.

Frontend environment file:

```text
client/.env
```

Backend environment file:

```text
server/.env
```

Do not commit real `.env` files.

### Frontend `.env` example

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend `.env` example

```env
PORT=3001
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 7. Run Project Locally

From the root folder:

```bash
npm run dev
```

This runs both frontend and backend.

Frontend URL:

```text
http://localhost:5173
```

Backend base URL:

```text
http://localhost:3001/api/v1
```

Health check:

```text
http://localhost:3001/api/v1/health
```

Expected health response:

```json
{
  "ok": true,
  "message": "UniDeadline Tracker API is running",
  "service": "server",
  "timestamp": "..."
}
```

## 8. Run Frontend Only

```bash
npm run dev:client
```

or:

```bash
cd client
npm run dev
```

## 9. Run Backend Only

```bash
npm run dev:server
```

or:

```bash
cd server
npm run dev
```

## 10. Repository Structure

```text
unideadline-tracker/
├── client/              # React + Tailwind frontend
├── server/              # Node.js + Express backend
├── docs/                # Project documents for team and AI Agent
├── database/            # SQL schema, seed data, ERD notes
├── scripts/             # Optional helper scripts
├── .env.example         # Environment variable template
├── README.md            # Project overview
└── package.json         # Root scripts
```

## 11. Demo Strategy

Local demo is the required fallback.

Required local demo components:

- Frontend local
- Backend local
- Supabase cloud database/auth
- Demo account
- Seeded courses and deadlines
- README setup guide

Online deployment is optional if time allows.

Recommended deployment:

- Frontend: Vercel or Netlify
- Backend: Render or Railway
- Database/Auth: Supabase

## 12. Common Problems

### Problem: Tailwind plugin not found

Install Tailwind inside `client/`:

```bash
cd client
npm install tailwindcss @tailwindcss/vite
```

### Problem: Backend port already in use

Change `PORT` in `server/.env` or stop the running process.

### Problem: Frontend cannot call backend

Check:

- Backend is running
- `VITE_API_BASE_URL` is correct
- CORS allows `http://localhost:5173`

## 13. Important Rule

Do not commit:

- `.env`
- API keys
- Supabase service role key
- Real user data
- Private credentials