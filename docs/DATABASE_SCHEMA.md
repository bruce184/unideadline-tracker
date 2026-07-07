# DATABASE SCHEMA - UniDeadline Tracker

## 1. Purpose

This file is the Supabase PostgreSQL schema source of truth for the UniDeadline Tracker MVP.

MVP decision:

- Core tables: `profiles`, `courses`, `deadlines`, `reminders`.
- Implemented extension tables: `gmail_connections`, `friendships`, `group_projects`, `group_project_members`, `group_tasks`.
- Submission/document URL is stored in `deadlines.submission_link`.
- Do not create `deadline_links` in MVP.
- Multiple links and file upload are future scope.

This file must stay aligned with `docs/API_CONTRACT.md`.

---

## 2. Database Platform

| Item | Decision |
|---|---|
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| User identity source | `auth.users` |
| Public app schema | `public` |
| Primary key type | `uuid` |
| Date/time type | `timestamptz` |
| API datetime format | ISO 8601; datetime fields require `Z` or a `+/-HH:MM` UTC offset |
| Display timezone | Asia/Ho_Chi_Minh |

Required extension:

```sql
create extension if not exists pgcrypto;
```

---

## 3. Ownership Rules

1. Each user owns one profile.
2. Each course belongs to one user.
3. Each deadline belongs to one user.
4. Each deadline must belong to one course owned by the same user.
5. Reminder records belong to a deadline.
6. Gmail connections belong to one user.
7. Group projects are owner-managed; members and tasks belong to an owned group project.
8. Users can only access their own courses, deadlines, reminders, Gmail connection, friends, and owned group projects.
9. Backend must not trust `user_id` from request body.
10. Backend must set owner/user identifiers from the authenticated Supabase user.

Ownership path:

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

---

## 4. MVP Tables

| Table | Purpose |
|---|---|
| `profiles` | Public profile data linked to Supabase Auth user |
| `courses` | Courses created by each user |
| `deadlines` | Academic deadlines/tasks for a course, including `submission_link` |
| `reminders` | Reminder rows calculated from deadline due date |
| `gmail_connections` | Current user's Gmail OAuth tokens and connected email |
| `friendships` | Owner-managed friend list by email |
| `group_projects` | Owner-managed group projects |
| `group_project_members` | Members assigned to an owned group project |
| `group_tasks` | Tasks and progress notes inside an owned group project |

---

## 5. Table: `profiles`

### 5.1. Columns

| Column | Type | Required | Default | Note |
|---|---|---:|---|---|
| `id` | uuid | Yes | None | Primary key, references `auth.users(id)` |
| `email` | text | Yes | None | User email |
| `display_name` | text | No | None | Max 120 characters |
| `created_at` | timestamptz | Yes | `now()` | Created timestamp |
| `updated_at` | timestamptz | Yes | `now()` | Updated timestamp |

### 5.2. SQL

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text check (display_name is null or length(display_name) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 5.3. Automatic Profile Creation

Frontend registration uses Supabase Auth with the anon key and sends
`display_name` in user metadata. A security-definer trigger creates the matching
profile without exposing the service role key to the client.

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

---

## 6. Table: `courses`

### 6.1. Columns

| Column | Type | Required | Default | Note |
|---|---|---:|---|---|
| `id` | uuid | Yes | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | Yes | None | Owner user |
| `course_name` | text | Yes | None | Max 120 characters |
| `course_code` | text | No | None | Max 50 characters |
| `semester` | text | No | None | Max 50 characters |
| `created_at` | timestamptz | Yes | `now()` | Created timestamp |
| `updated_at` | timestamptz | Yes | `now()` | Updated timestamp |

### 6.2. SQL

```sql
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_name text not null check (length(trim(course_name)) > 0 and length(course_name) <= 120),
  course_code text check (course_code is null or length(course_code) <= 50),
  semester text check (semester is null or length(semester) <= 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Recommended duplicate prevention:

```sql
create unique index if not exists uq_courses_user_name_semester
on public.courses (
  user_id,
  lower(trim(course_name)),
  coalesce(lower(trim(semester)), '')
);
```

Rules:

- `course_name` is required.
- Backend blocks course deletion if deadlines exist.
- Backend returns `409 COURSE_HAS_DEADLINES` in that case.

---

## 7. Table: `deadlines`

### 7.1. Columns

| Column | Type | Required | Default | Note |
|---|---|---:|---|---|
| `id` | uuid | Yes | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | Yes | None | Owner user |
| `course_id` | uuid | Yes | None | Related course |
| `title` | text | Yes | None | Max 160 characters |
| `due_date` | timestamptz | Yes | None | Deadline date/time |
| `status` | text | Yes | `Not Started` | Check constraint |
| `priority` | text | Yes | `Medium` | Check constraint |
| `description` | text | No | None | Max 2000 characters |
| `submission_link` | text | No | None | HTTP/HTTPS URL |
| `created_at` | timestamptz | Yes | `now()` | Created timestamp |
| `updated_at` | timestamptz | Yes | `now()` | Updated timestamp |

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

### 7.2. SQL

```sql
create table if not exists public.deadlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete no action,
  title text not null check (length(trim(title)) > 0 and length(title) <= 160),
  due_date timestamptz not null,
  status text not null default 'Not Started'
    check (status in ('Not Started', 'In Progress', 'Submitted', 'Overdue')),
  priority text not null default 'Medium'
    check (priority in ('High', 'Medium', 'Low')),
  description text check (description is null or length(description) <= 2000),
  submission_link text check (
    submission_link is null
    or submission_link ~* '^https?://'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Rules:

- Deadline must have `course_id`, `title`, and `due_date`.
- Backend must ensure `course_id` belongs to the current user.
- `Overdue` is derived when `due_date < now()` and status is not `Submitted`.
- `submission_link` stores the MVP document/submission link.
- Do not create a separate link table in MVP.

---

## 8. Table: `reminders`

### 8.1. Columns

| Column | Type | Required | Default | Note |
|---|---|---:|---|---|
| `id` | uuid | Yes | `gen_random_uuid()` | Primary key |
| `deadline_id` | uuid | Yes | None | Related deadline |
| `reminder_time` | timestamptz | Yes | None | Exact reminder trigger time |
| `offset_days` | integer | Yes | None | Offset used to calculate `reminder_time` |
| `channel` | text | Yes | `in_app` | Check constraint |
| `sent_status` | text | Yes | `pending` | Check constraint |
| `created_at` | timestamptz | Yes | `now()` | Created timestamp |
| `updated_at` | timestamptz | Yes | `now()` | Updated timestamp |

Allowed channels:

```text
in_app
email
```

Allowed sent status:

```text
pending
sent
failed
```

### 8.2. SQL

```sql
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  deadline_id uuid not null references public.deadlines(id) on delete cascade,
  reminder_time timestamptz not null,
  offset_days integer not null
    check (offset_days in (0, 1, 3, 7)),
  channel text not null default 'in_app'
    check (channel in ('in_app', 'email')),
  sent_status text not null default 'pending'
    check (sent_status in ('pending', 'sent', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Rules:

- Each reminder row stores one scheduled reminder occurrence.
- Backend creates reminder rows from the `reminder_offsets` request field.
- `reminder_time` is calculated from `deadlines.due_date - offset_days`.
- MVP offsets are `7`, `3`, `1`, and `0` days before due date.
- `channel` defaults to `in_app`.
- Submitted deadlines should not appear in reminder alerts.
- Disabling reminders removes pending reminder rows for that deadline.

---

## 9. Relationships and Delete Behavior

| Relationship | Rule |
|---|---|
| `profiles.id -> auth.users.id` | One profile per auth user |
| `courses.user_id -> auth.users.id` | One user has many courses |
| `deadlines.user_id -> auth.users.id` | One user has many deadlines |
| `deadlines.course_id -> courses.id` | One course has many deadlines |
| `reminders.deadline_id -> deadlines.id` | One deadline has many reminders |

Delete behavior:

| Deleted record | Expected behavior |
|---|---|
| Auth user | Delete related profile/courses/deadlines through cascade path |
| Course | Block deletion if deadlines exist |
| Deadline | Delete related reminders |
| Reminder | Delete only that reminder |

---

## 10. Indexes

```sql
create index if not exists idx_courses_user_id
on public.courses(user_id);

create index if not exists idx_courses_user_semester
on public.courses(user_id, semester);

create index if not exists idx_deadlines_user_id
on public.deadlines(user_id);

create index if not exists idx_deadlines_course_id
on public.deadlines(course_id);

create index if not exists idx_deadlines_user_due_date
on public.deadlines(user_id, due_date);

create index if not exists idx_deadlines_user_status
on public.deadlines(user_id, status);

create index if not exists idx_deadlines_user_priority
on public.deadlines(user_id, priority);

create index if not exists idx_reminders_deadline_id
on public.reminders(deadline_id);

create unique index if not exists uq_reminders_deadline_offset_channel
on public.reminders(deadline_id, offset_days, channel);

create index if not exists idx_reminders_time_status
on public.reminders(reminder_time, sent_status);
```

---

## 11. Updated Timestamp Trigger

```sql
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```

```sql
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_courses_updated_at on public.courses;
create trigger trg_courses_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists trg_deadlines_updated_at on public.deadlines;
create trigger trg_deadlines_updated_at
before update on public.deadlines
for each row execute function public.set_updated_at();

drop trigger if exists trg_reminders_updated_at on public.reminders;
create trigger trg_reminders_updated_at
before update on public.reminders
for each row execute function public.set_updated_at();
```

---

## 12. Row Level Security

Enable RLS:

```sql
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.deadlines enable row level security;
alter table public.reminders enable row level security;
```

### 12.1. Profiles

```sql
create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);
```

### 12.2. Courses

```sql
create policy "Users can view own courses"
on public.courses for select
using (auth.uid() = user_id);

create policy "Users can insert own courses"
on public.courses for insert
with check (auth.uid() = user_id);

create policy "Users can update own courses"
on public.courses for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own courses"
on public.courses for delete
using (auth.uid() = user_id);
```

### 12.3. Deadlines

```sql
create policy "Users can view own deadlines"
on public.deadlines for select
using (auth.uid() = user_id);

create policy "Users can insert own deadlines"
on public.deadlines for insert
with check (auth.uid() = user_id);

create policy "Users can update own deadlines"
on public.deadlines for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own deadlines"
on public.deadlines for delete
using (auth.uid() = user_id);
```

### 12.4. Reminders

Reminder ownership is checked through the related deadline.

```sql
create policy "Users can view own reminders"
on public.reminders for select
using (
  exists (
    select 1 from public.deadlines d
    where d.id = reminders.deadline_id
      and d.user_id = auth.uid()
  )
);

create policy "Users can insert own reminders"
on public.reminders for insert
with check (
  exists (
    select 1 from public.deadlines d
    where d.id = reminders.deadline_id
      and d.user_id = auth.uid()
  )
);

create policy "Users can update own reminders"
on public.reminders for update
using (
  exists (
    select 1 from public.deadlines d
    where d.id = reminders.deadline_id
      and d.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.deadlines d
    where d.id = reminders.deadline_id
      and d.user_id = auth.uid()
  )
);

create policy "Users can delete own reminders"
on public.reminders for delete
using (
  exists (
    select 1 from public.deadlines d
    where d.id = reminders.deadline_id
      and d.user_id = auth.uid()
  )
);
```

---

## 13. Implemented Extension Tables

The current source includes Gmail sync and owner-managed group tracking tables in `database/schema.sql`.

Gmail:

- `deadlines.gmail_message_id` stores the source Gmail message id for dedupe.
- `gmail_connections` stores the current user's connected Gmail address and OAuth tokens.
- `uq_deadlines_user_gmail_message` prevents importing the same Gmail message twice for one user.

Groups:

- `friendships` stores a user's friend list by email.
- `group_projects` stores projects owned by a user.
- `group_project_members` stores members of an owned project.
- `group_tasks` stores task assignment, due date, status, and progress note.
- `uq_group_project_members_project_email` prevents duplicate project members by email.

Group tracking is owner-managed. A listed member does not automatically get cross-account access to the project.

---

## 14. Suggested SQL Files

Baseline setup should create:

```text
database/schema.sql
database/seed.sql
```

Recommended order in `schema.sql`:

1. Extensions
2. Tables
3. Unique constraints/indexes
4. Normal indexes
5. Updated_at trigger function
6. Triggers
7. RLS enable statements
8. RLS policies

---

## 15. Demo Seed Data

Minimum demo data:

| Data | Minimum |
|---|---:|
| Demo account | 1 |
| Courses | 5 |
| Deadlines | 20 |
| Deadlines with reminder rows | 5 |
| Reminder rows | 15 |
| Deadlines without pending reminders | 2 |
| Deadlines with `submission_link` | 8 |

Deadline coverage:

- Due today
- Due this week
- Due next week
- Overdue
- Submitted overdue cases
- Submitted
- High, Medium, Low priorities
- Deadlines with and without pending reminders
- With and without `submission_link`

Do not use real private student data.

---

## 16. Future Scope Tables

Do not create these in MVP unless approved:

```text
deadline_links
file_uploads
projects
invitations
lms_integrations
calendar_integrations
ai_prediction_logs
admin_reports
```

