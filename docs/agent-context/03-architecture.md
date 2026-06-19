# Architecture

## High-Level Flow

```text
React UI
  -> frontend service function
  -> Express API route
  -> controller
  -> model
  -> Supabase query
  -> PostgreSQL tables with RLS
```

## Frontend Rules

1. UI components should not hardcode backend URLs.
2. Read API base URL from `VITE_API_BASE_URL`.
3. Keep API calls in service functions once the feature grows beyond a single screen.
4. Handle loading, error, empty, and success states.
5. Validate required form fields before submit.
6. Use `submission_link` in deadline create/edit/detail screens.

## Backend Rules

1. API response format must match `docs/API_CONTRACT.md`.
2. Private endpoints require `Authorization: Bearer <access_token>`.
3. Validate body, params, and query values.
4. Do not trust `user_id` from the request body.
5. Derive `user_id` from the authenticated Supabase user.
6. Keep ownership checks server-side.
7. Do not add endpoints outside the contract unless the docs are updated and the task explicitly allows it.
8. Keep Supabase/Auth queries in `server/src/models/`; controllers handle request validation, orchestration, and responses.
9. Add a service layer only for business logic that should not live in a controller or model.

## Database Rules

1. Schema source of truth is `docs/DATABASE_SCHEMA.md`.
2. Core tables are `profiles`, `courses`, `deadlines`, and `reminders`.
3. Enable RLS on app tables.
4. Users can only access their own data.
5. Use fake demo seed data only.

## Change Control

If a task requires changing architecture, API contract, or database schema, update the relevant docs in the same branch and call it out in the completion report.
