# System Overview

## Product

UniDeadline Tracker is a responsive web app for university students. It helps students manage courses, academic deadlines, submission status, weekly workload, reminders, Gmail-imported deadlines, AI suggestions, owner-managed group tasks, and submission links.

## Demo Strategy

- Local demo is required.
- Online deployment is optional.
- The baseline branch is `main`.
- The project should remain simple enough for a student team to understand and present.

## MVP Modules

```text
Auth / User Account
Course Management
Deadline Management
Submission Status Tracking
Weekly Dashboard
Reminder & Priority
Search & Filter
Responsive Web App
Basic In-app Reminder
Submission Link Storage
AI Suggestions Chat
Gmail OAuth Sync and Deadline Import
Optional Email Reminder
Owner-managed Friends and Group Task Tracking
```

## Product Boundary

The product is still local-demo-first and student-team friendly. Group tracking is owner-managed for demo planning; it is not real-time cross-account collaboration, not a full LMS, and not a native mobile app.

## Core Decisions

1. Supabase Auth owns user identity.
2. Supabase PostgreSQL stores app data.
3. Backend APIs follow `docs/API_CONTRACT.md`.
4. Database schema follows `docs/DATABASE_SCHEMA.md`.
5. Submission/document URL is stored in `deadlines.submission_link`.
6. Gmail import stores the source message id in `deadlines.gmail_message_id` for dedupe.
7. Group tracking is owner-managed through `group_projects`, `group_project_members`, and `group_tasks`.
8. Multiple links, file upload, and `deadline_links` are future scope.
