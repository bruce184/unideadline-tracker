-- UniDeadline Tracker MVP Supabase schema
-- Run this file in the Supabase SQL Editor before database/seed.sql.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text check (display_name is null or length(display_name) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_name text not null check (length(trim(course_name)) > 0 and length(course_name) <= 120),
  course_code text check (course_code is null or length(course_code) <= 50),
  semester text check (semester is null or length(semester) <= 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create unique index if not exists uq_courses_user_name_semester
on public.courses (
  user_id,
  lower(trim(course_name)),
  coalesce(lower(trim(semester)), '')
);

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

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

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

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.deadlines enable row level security;
alter table public.reminders enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can view own courses" on public.courses;
create policy "Users can view own courses"
on public.courses for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own courses" on public.courses;
create policy "Users can insert own courses"
on public.courses for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own courses" on public.courses;
create policy "Users can update own courses"
on public.courses for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own courses" on public.courses;
create policy "Users can delete own courses"
on public.courses for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view own deadlines" on public.deadlines;
create policy "Users can view own deadlines"
on public.deadlines for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own deadlines" on public.deadlines;
create policy "Users can insert own deadlines"
on public.deadlines for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own deadlines" on public.deadlines;
create policy "Users can update own deadlines"
on public.deadlines for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own deadlines" on public.deadlines;
create policy "Users can delete own deadlines"
on public.deadlines for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view own reminders" on public.reminders;
create policy "Users can view own reminders"
on public.reminders for select
using (
  exists (
    select 1 from public.deadlines d
    where d.id = reminders.deadline_id
      and d.user_id = auth.uid()
  )
);

drop policy if exists "Users can insert own reminders" on public.reminders;
create policy "Users can insert own reminders"
on public.reminders for insert
with check (
  exists (
    select 1 from public.deadlines d
    where d.id = reminders.deadline_id
      and d.user_id = auth.uid()
  )
);

drop policy if exists "Users can update own reminders" on public.reminders;
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

drop policy if exists "Users can delete own reminders" on public.reminders;
create policy "Users can delete own reminders"
on public.reminders for delete
using (
  exists (
    select 1 from public.deadlines d
    where d.id = reminders.deadline_id
      and d.user_id = auth.uid()
  )
);
