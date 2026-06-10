# System Overview

## Product

UniDeadline Tracker is a responsive web app for university students. It helps students manage courses, academic deadlines, submission status, weekly workload, reminders, and submission links.

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
```

## Product Boundary

The MVP is a personal deadline tracker, not a full LMS, not a team collaboration platform, and not a native mobile app.

## Core Decisions

1. Supabase Auth owns user identity.
2. Supabase PostgreSQL stores app data.
3. Backend APIs follow `docs/API_CONTRACT.md`.
4. Database schema follows `docs/DATABASE_SCHEMA.md`.
5. Submission/document URL is stored in `deadlines.submission_link`.
6. Multiple links, file upload, and `deadline_links` are future scope.
