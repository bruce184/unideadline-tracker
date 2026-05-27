# DATABASE SCHEMA - UniDeadline Tracker

## 1. Purpose

This file describes the planned database schema for the UniDeadline Tracker MVP.

Database:

```text
Supabase PostgreSQL
```

The schema should support:

- User profile
- Courses
- Deadlines
- Submission status
- Reminder settings
- Document/submission links
- Demo data

## 2. Core Rules

- Each user owns their own data.
- Each course belongs to one user.
- Each deadline belongs to one user.
- Each deadline should belong to one course.
- Users can only view, edit, and delete their own data.
- Group collaboration is out of MVP.
- Mobile native data model is out of MVP.
- Full LMS/Outlook integration is out of MVP.

## 3. Tables

---

## 3.1. `profiles`

Stores user profile data linked to Supabase Auth.

| Field | Type | Required | Note |
|---|---|---:|---|
| `id` | uuid | Yes | Primary key, same as Supabase Auth user id |
| `email` | text | Yes | User email |
| `display_name` | text | No | Optional display name |
| `created_at` | timestamptz | Yes | Created time |
| `updated_at` | timestamptz | No | Updated time |

Suggested SQL:

```sql
create table if not exists profiles (
  id uuid primary key,
  email text not null,
  display_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

## 3.2. `courses`

Stores courses created by each user.

| Field | Type | Required | Note |
|---|---|---:|---|
| `id` | uuid | Yes | Primary key |
| `user_id` | uuid | Yes | Owner user |
| `course_name` | text | Yes | Course name |
| `course_code` | text | No | Course code |
| `semester` | text | No | Semester |
| `created_at` | timestamptz | Yes | Created time |
| `updated_at` | timestamptz | No | Updated time |

Suggested SQL:

```sql
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  course_name text not null,
  course_code text,
  semester text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Validation rules:

- `course_name` is required.
- A user should not create duplicate course names in the same semester if validation is implemented.

---

## 3.3. `deadlines`

Core table for deadlines.

| Field | Type | Required | Note |
|---|---|---:|---|
| `id` | uuid | Yes | Primary key |
| `user_id` | uuid | Yes | Owner user |
| `course_id` | uuid | Yes | Related course |
| `title` | text | Yes | Deadline title |
| `due_date` | timestamptz | Yes | Deadline date/time |
| `status` | text | Yes | Not Started / In Progress / Submitted / Overdue |
| `priority` | text | Yes | High / Medium / Low |
| `description` | text | No | Assignment description |
| `submission_link` | text | No | Submission URL |
| `created_at` | timestamptz | Yes | Created time |
| `updated_at` | timestamptz | No | Updated time |

Suggested SQL:

```sql
create table if not exists deadlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  due_date timestamptz not null,
  status text not null default 'Not Started',
  priority text not null default 'Medium',
  description text,
  submission_link text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Allowed status values:

```text
Not Started
In Progress
Submitted
Overdue
```

Allowed priority values:

```text
High
Medium
Low
```

Business rules:

- Deadline must have `title`, `course_id`, and `due_date`.
- Deadline must belong to the current user.
- Deadline can become `Overdue` when `due_date < now` and status is not `Submitted`.

---

## 3.4. `reminders`

Stores reminder settings and sending status.

| Field | Type | Required | Note |
|---|---|---:|---|
| `id` | uuid | Yes | Primary key |
| `deadline_id` | uuid | Yes | Related deadline |
| `reminder_time` | timestamptz | Yes | Reminder time |
| `channel` | text | Yes | in_app / email |
| `sent_status` | text | Yes | pending / sent / failed |
| `created_at` | timestamptz | Yes | Created time |

Suggested SQL:

```sql
create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  deadline_id uuid not null references deadlines(id) on delete cascade,
  reminder_time timestamptz not null,
  channel text not null default 'in_app',
  sent_status text not null default 'pending',
  created_at timestamptz default now()
);
```

MVP reminder rule:

- Default reminder offsets: 7 days, 3 days, 1 day.
- In-app reminder first.
- Email reminder only if time allows.
- Submitted deadlines should not continue sending reminders.

---

## 3.5. `deadline_links`

Stores document links or submission links related to deadline.

| Field | Type | Required | Note |
|---|---|---:|---|
| `id` | uuid | Yes | Primary key |
| `deadline_id` | uuid | Yes | Related deadline |
| `url` | text | Yes | Link URL |
| `file_name` | text | No | Display name |
| `file_type` | text | No | link / file |
| `created_at` | timestamptz | Yes | Created time |

Suggested SQL:

```sql
create table if not exists deadline_links (
  id uuid primary key default gen_random_uuid(),
  deadline_id uuid not null references deadlines(id) on delete cascade,
  url text not null,
  file_name text,
  file_type text default 'link',
  created_at timestamptz default now()
);
```

MVP rule:

- Store URL first.
- Upload file only if core MVP is stable.

---

## 4. Suggested Indexes

```sql
create index if not exists idx_courses_user_id on courses(user_id);
create index if not exists idx_deadlines_user_id on deadlines(user_id);
create index if not exists idx_deadlines_course_id on deadlines(course_id);
create index if not exists idx_deadlines_due_date on deadlines(due_date);
create index if not exists idx_reminders_deadline_id on reminders(deadline_id);
create index if not exists idx_deadline_links_deadline_id on deadline_links(deadline_id);
```

## 5. Demo Seed Data

For demo, prepare:

- At least 1 demo account
- At least 5 courses
- At least 20 deadlines
- Deadlines for today, this week, next week, overdue, and submitted
- Priority values: High, Medium, Low
- Status values: Not Started, In Progress, Submitted, Overdue

## 6. Future Scope Tables

Do not implement these in MVP unless approved:

- `projects`
- `project_members`
- `group_tasks`
- `invitations`
- `lms_integrations`
- `ai_prediction_logs`

These belong to v2.0 or PoC.