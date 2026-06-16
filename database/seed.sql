-- UniDeadline Tracker MVP demo seed data
-- Prerequisite: create a Supabase Auth user with this email first:
-- student@example.com
--
-- This file only inserts fake demo app data for that user. It does not create
-- auth credentials or store passwords in the repository.

do $$
declare
  demo_user_id uuid;
  spm_course_id uuid := '11111111-1111-4111-8111-111111111111';
  db_course_id uuid := '22222222-2222-4222-8222-222222222222';
  web_course_id uuid := '33333333-3333-4333-8333-333333333333';
  ai_course_id uuid := '44444444-4444-4444-8444-444444444444';
  sec_course_id uuid := '55555555-5555-4555-8555-555555555555';
begin
  select id
  into demo_user_id
  from auth.users
  where email = 'student@example.com'
  limit 1;

  if demo_user_id is null then
    raise exception 'Create Supabase Auth user student@example.com before running database/seed.sql';
  end if;

  insert into public.profiles (id, email, display_name)
  values (demo_user_id, 'student@example.com', 'Demo Student')
  on conflict (id) do update
  set email = excluded.email,
      display_name = excluded.display_name;

  insert into public.courses (id, user_id, course_name, course_code, semester)
  values
    (spm_course_id, demo_user_id, 'Software Project Management', 'BIT304V1', 'SUM2026'),
    (db_course_id, demo_user_id, 'Database Systems', 'BIT203V1', 'SUM2026'),
    (web_course_id, demo_user_id, 'Web Application Development', 'BIT301V1', 'SUM2026'),
    (ai_course_id, demo_user_id, 'Artificial Intelligence', 'BIT401V1', 'SUM2026'),
    (sec_course_id, demo_user_id, 'Information Security', 'BIT305V1', 'SUM2026')
  on conflict (id) do update
  set course_name = excluded.course_name,
      course_code = excluded.course_code,
      semester = excluded.semester;

  insert into public.deadlines (
    id,
    user_id,
    course_id,
    title,
    due_date,
    status,
    priority,
    description,
    submission_link
  )
  values
    ('aaaaaaaa-0001-4000-8000-000000000001', demo_user_id, spm_course_id, 'Submit project charter', now() + interval '6 hours', 'In Progress', 'High', 'Define scope, roles, and milestone plan.', 'https://example.com/spm/project-charter'),
    ('aaaaaaaa-0002-4000-8000-000000000002', demo_user_id, spm_course_id, 'Weekly risk log update', now() + interval '2 days', 'Not Started', 'Medium', 'Update active risks and mitigation notes.', null),
    ('aaaaaaaa-0003-4000-8000-000000000003', demo_user_id, spm_course_id, 'Sprint review slides', now() + interval '5 days', 'Not Started', 'High', 'Prepare concise demo slides for the sprint review.', 'https://example.com/spm/sprint-review'),
    ('aaaaaaaa-0004-4000-8000-000000000004', demo_user_id, spm_course_id, 'Final retrospective note', now() + interval '12 days', 'Not Started', 'Low', 'Summarize team process improvements.', null),
    ('aaaaaaaa-0005-4000-8000-000000000005', demo_user_id, db_course_id, 'ERD draft submission', now() - interval '2 days', 'Overdue', 'High', 'Submit the first ERD draft for feedback.', 'https://example.com/db/erd-draft'),
    ('aaaaaaaa-0006-4000-8000-000000000006', demo_user_id, db_course_id, 'Normalization worksheet', now() + interval '1 day', 'In Progress', 'Medium', 'Complete 1NF, 2NF, and 3NF exercises.', null),
    ('aaaaaaaa-0007-4000-8000-000000000007', demo_user_id, db_course_id, 'SQL lab checkpoint', now() + interval '7 days', 'Not Started', 'Medium', 'Upload SQL scripts for lab checkpoint.', 'https://example.com/db/sql-lab'),
    ('aaaaaaaa-0008-4000-8000-000000000008', demo_user_id, db_course_id, 'Query optimization quiz', now() + interval '15 days', 'Not Started', 'Low', 'Review indexes and execution plans.', null),
    ('aaaaaaaa-0009-4000-8000-000000000009', demo_user_id, web_course_id, 'Responsive layout task', now() + interval '3 days', 'In Progress', 'High', 'Build laptop and mobile views for the assigned page.', 'https://example.com/web/responsive-layout'),
    ('aaaaaaaa-0010-4000-8000-000000000010', demo_user_id, web_course_id, 'React state exercise', now() - interval '6 days', 'Submitted', 'Medium', 'Submit component state exercise.', 'https://example.com/web/react-state'),
    ('aaaaaaaa-0011-4000-8000-000000000011', demo_user_id, web_course_id, 'API integration lab', now() + interval '9 days', 'Not Started', 'High', 'Connect frontend service calls to API endpoints.', null),
    ('aaaaaaaa-0012-4000-8000-000000000012', demo_user_id, web_course_id, 'Accessibility checklist', now() + interval '18 days', 'Not Started', 'Low', 'Review labels, contrast, and keyboard access.', null),
    ('aaaaaaaa-0013-4000-8000-000000000013', demo_user_id, ai_course_id, 'Search algorithm homework', now() + interval '4 days', 'Not Started', 'Medium', 'Complete BFS, DFS, and A* questions.', 'https://example.com/ai/search-homework'),
    ('aaaaaaaa-0014-4000-8000-000000000014', demo_user_id, ai_course_id, 'Model evaluation report', now() + interval '10 days', 'Not Started', 'High', 'Compare model metrics and document findings.', 'https://example.com/ai/evaluation-report'),
    ('aaaaaaaa-0015-4000-8000-000000000015', demo_user_id, ai_course_id, 'Ethics reflection', now() - interval '1 day', 'Overdue', 'Medium', 'Write a short reflection on responsible AI use.', null),
    ('aaaaaaaa-0016-4000-8000-000000000016', demo_user_id, ai_course_id, 'Mini project proposal', now() + interval '21 days', 'Not Started', 'Medium', 'Submit the proposal for the mini AI project.', null),
    ('aaaaaaaa-0017-4000-8000-000000000017', demo_user_id, sec_course_id, 'Threat model worksheet', now() + interval '6 days', 'In Progress', 'High', 'Identify assets, threats, and mitigations.', 'https://example.com/sec/threat-model'),
    ('aaaaaaaa-0018-4000-8000-000000000018', demo_user_id, sec_course_id, 'Password policy critique', now() - interval '9 days', 'Submitted', 'Low', 'Critique a sample password policy.', null),
    ('aaaaaaaa-0019-4000-8000-000000000019', demo_user_id, sec_course_id, 'Network security lab', now() + interval '13 days', 'Not Started', 'High', 'Complete packet analysis lab tasks.', 'https://example.com/sec/network-lab'),
    ('aaaaaaaa-0020-4000-8000-000000000020', demo_user_id, sec_course_id, 'Final exam review plan', now() + interval '28 days', 'Not Started', 'Medium', 'Prepare a review plan for major exam topics.', null)
  on conflict (id) do update
  set course_id = excluded.course_id,
      title = excluded.title,
      due_date = excluded.due_date,
      status = excluded.status,
      priority = excluded.priority,
      description = excluded.description,
      submission_link = excluded.submission_link;

  insert into public.reminders (id, deadline_id, reminder_time, offset_days, channel, sent_status)
  select
    reminder_id,
    deadline_id,
    d.due_date - make_interval(days => offset_days),
    offset_days,
    'in_app',
    'pending'
  from (
    values
      ('bbbbbbbb-0001-4000-8000-000000000001'::uuid, 'aaaaaaaa-0001-4000-8000-000000000001'::uuid, 7),
      ('bbbbbbbb-0002-4000-8000-000000000002'::uuid, 'aaaaaaaa-0001-4000-8000-000000000001'::uuid, 3),
      ('bbbbbbbb-0003-4000-8000-000000000003'::uuid, 'aaaaaaaa-0001-4000-8000-000000000001'::uuid, 1),
      ('bbbbbbbb-0004-4000-8000-000000000004'::uuid, 'aaaaaaaa-0003-4000-8000-000000000003'::uuid, 7),
      ('bbbbbbbb-0005-4000-8000-000000000005'::uuid, 'aaaaaaaa-0003-4000-8000-000000000003'::uuid, 3),
      ('bbbbbbbb-0006-4000-8000-000000000006'::uuid, 'aaaaaaaa-0003-4000-8000-000000000003'::uuid, 1),
      ('bbbbbbbb-0007-4000-8000-000000000007'::uuid, 'aaaaaaaa-0007-4000-8000-000000000007'::uuid, 7),
      ('bbbbbbbb-0008-4000-8000-000000000008'::uuid, 'aaaaaaaa-0007-4000-8000-000000000007'::uuid, 3),
      ('bbbbbbbb-0009-4000-8000-000000000009'::uuid, 'aaaaaaaa-0007-4000-8000-000000000007'::uuid, 1),
      ('bbbbbbbb-0010-4000-8000-000000000010'::uuid, 'aaaaaaaa-0009-4000-8000-000000000009'::uuid, 7),
      ('bbbbbbbb-0011-4000-8000-000000000011'::uuid, 'aaaaaaaa-0009-4000-8000-000000000009'::uuid, 3),
      ('bbbbbbbb-0012-4000-8000-000000000012'::uuid, 'aaaaaaaa-0009-4000-8000-000000000009'::uuid, 1),
      ('bbbbbbbb-0013-4000-8000-000000000013'::uuid, 'aaaaaaaa-0017-4000-8000-000000000017'::uuid, 7),
      ('bbbbbbbb-0014-4000-8000-000000000014'::uuid, 'aaaaaaaa-0017-4000-8000-000000000017'::uuid, 3),
      ('bbbbbbbb-0015-4000-8000-000000000015'::uuid, 'aaaaaaaa-0017-4000-8000-000000000017'::uuid, 1)
  ) as reminder_seed(reminder_id, deadline_id, offset_days)
  join public.deadlines d on d.id = reminder_seed.deadline_id
  on conflict (id) do update
  set reminder_time = excluded.reminder_time,
      offset_days = excluded.offset_days,
      channel = excluded.channel,
      sent_status = excluded.sent_status;
end $$;
