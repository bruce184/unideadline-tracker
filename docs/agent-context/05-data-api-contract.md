# Data and API Contract

## Source of Truth

- API: `docs/API_CONTRACT.md`
- Database: `docs/DATABASE_SCHEMA.md`

Agents must not invent endpoint paths, request fields, response fields, table columns, enum values, or error codes.

## Standard API Response

Follow the response envelope defined in `docs/API_CONTRACT.md`.

Do not return ad hoc response shapes from new routes.

## Core Tables

```text
profiles
courses
deadlines
reminders
```

Implemented extension tables:

```text
gmail_connections
friendships
group_projects
group_project_members
group_tasks
```

## Core Ownership

```text
auth.users
  -> profiles
  -> courses
  -> deadlines
  -> reminders
  -> gmail_connections
  -> friendships
  -> group_projects
       -> group_project_members
       -> group_tasks
```

## Required Data Rule

Backend code must set ownership from the authenticated user. It must not accept client-provided ownership as truth.

## Submission Link Rule

The only MVP submission/document link field is:

```text
deadlines.submission_link
```

## Gmail Import Rule

`POST /gmail/import` requires the selected `course_id` in addition to `days`.
The backend must verify that the selected course belongs to the authenticated
user before creating imported deadlines.

## Group Tracking Rule

Friends and group projects are owner-managed demo features. Listed project
members do not automatically receive cross-account access.

## API or Schema Change Checklist

Before changing API or schema:

1. Confirm the assignment explicitly asks for it.
2. Update `docs/API_CONTRACT.md` if endpoint behavior changes.
3. Update `docs/DATABASE_SCHEMA.md` if table behavior changes.
4. Update setup docs if migrations, env, or seed steps change.
5. Mention the change in the completion report.
