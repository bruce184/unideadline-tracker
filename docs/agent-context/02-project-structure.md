# Project Structure

## Repository Layout

```text
unideadline-tracker/
+-- client/              # React + Tailwind + Vite frontend
+-- server/              # Node.js + Express backend
+-- docs/                # Project docs for team members and AI Agents
+-- docs/agent-context/  # Short agent-readable context files
+-- docs/implementation/ # Scope-lock rules, task template, handoff notes
+-- database/            # SQL schema, seed data, ERD notes
+-- scripts/             # Optional helper scripts
+-- .env.example         # Safe environment variable template
+-- AGENTS.md            # Root instructions for AI Agents
+-- README.md            # Project overview
+-- package.json         # Root scripts
```

## Frontend Placement

Use `client/src/` for React code.

Suggested structure as the MVP grows:

```text
client/src/
+-- components/      # Reusable UI components
+-- pages/           # Route-level pages
+-- services/        # API service functions
+-- hooks/           # Shared React hooks
+-- utils/           # Pure helper functions
+-- styles/          # Shared style helpers if needed
```

## Backend Placement

Use `server/src/` for Express code.

Suggested structure as the API grows:

```text
server/src/
+-- index.js         # App bootstrap
+-- routes/          # Route registration
+-- controllers/     # Request validation, orchestration, and responses
+-- models/          # Supabase/Auth data access by domain entity
+-- services/        # Optional complex business logic
+-- middleware/      # Auth, validation, errors
+-- utils/           # Pure helper functions
```

Backend request flow:

```text
route -> controller -> model -> Supabase
```

Controllers must not call Supabase directly. Add a service layer only when
business logic is complex enough to justify it.

## Database Placement

Use `database/` for SQL files:

```text
database/
+-- schema.sql       # Tables, constraints, indexes, RLS
+-- seed.sql         # Fake demo data only
+-- README.md        # Optional database notes
```

## File Placement Rule

Before creating a new file, identify:

1. Which app layer it belongs to: frontend, backend, database, docs, script.
2. Which feature it belongs to: auth, courses, deadlines, dashboard, reminders, search/filter.
3. Whether an existing file already covers the same responsibility.
