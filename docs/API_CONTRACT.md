# API CONTRACT - UniDeadline Tracker

## 1. Purpose

This file is the API source of truth for UniDeadline Tracker.

Frontend and backend must follow this contract. If endpoint behavior, request fields, response fields, validation, or error codes change, update this file in the same task.

MVP decision:

- Store document/submission URL directly in `deadlines.submission_link`.
- Do not create `deadline_links` table or `/links` endpoints in MVP.
- File upload and multiple links are future scope.

---

## 2. Base URL

Local backend:

```text
http://localhost:3001/api/v1
```

Frontend env:

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

---

## 3. API Conventions

| Item | Rule |
|---|---|
| Request format | JSON |
| Response format | JSON |
| ID format | UUID string |
| Date/time format | ISO 8601; datetime fields require `Z` or a `+/-HH:MM` UTC offset |
| Display timezone | Asia/Ho_Chi_Minh |
| Auth provider | Supabase Auth |
| Protected auth header | `Authorization: Bearer <access_token>` |

Protected endpoints require:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Public endpoints:

- `GET /health`

All other endpoints are protected.

---

## 4. Standard Response Format

Success response:

```json
{
  "ok": true,
  "data": {},
  "message": "Success"
}
```

Paginated list response:

```json
{
  "ok": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "total_pages": 0
  },
  "message": "Success"
}
```

Error response:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "title",
        "message": "Title is required"
      }
    ]
  }
}
```

`details` is optional.

---

## 5. Error Codes

| HTTP | Code | Meaning |
|---:|---|---|
| 400 | `VALIDATION_ERROR` | Invalid request body |
| 400 | `INVALID_QUERY` | Invalid query/filter/sort/date range |
| 400 | `INVALID_URL` | `submission_link` is not a valid HTTP/HTTPS URL |
| 401 | `UNAUTHORIZED` | Missing/invalid/expired token |
| 404 | `NOT_FOUND` | Resource does not exist or does not belong to current user |
| 409 | `CONFLICT` | Duplicate or conflicting data |
| 409 | `COURSE_HAS_DEADLINES` | Course cannot be deleted because it still has deadlines |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server/database error |

For private resources, return `404 NOT_FOUND` when the resource exists but does not belong to the current user.

---

## 6. Data Objects

### 6.1. Profile

```json
{
  "id": "user-uuid",
  "email": "student@example.com",
  "display_name": "Student Name",
  "created_at": "2026-06-10T08:00:00.000Z",
  "updated_at": "2026-06-10T08:00:00.000Z"
}
```

### 6.2. Course

```json
{
  "id": "course-uuid",
  "user_id": "user-uuid",
  "course_name": "Software Project Management",
  "course_code": "BIT304V1",
  "semester": "SUM2026",
  "created_at": "2026-06-10T08:00:00.000Z",
  "updated_at": "2026-06-10T08:00:00.000Z"
}
```

### 6.3. Deadline

```json
{
  "id": "deadline-uuid",
  "user_id": "user-uuid",
  "course_id": "course-uuid",
  "title": "Submit project report",
  "due_date": "2026-06-20T23:59:00+07:00",
  "status": "Not Started",
  "priority": "High",
  "description": "Submit the final project report",
  "submission_link": "https://example.com/submit",
  "course": {
    "id": "course-uuid",
    "course_name": "Software Project Management",
    "course_code": "BIT304V1"
  },
  "created_at": "2026-06-10T08:00:00.000Z",
  "updated_at": "2026-06-10T08:00:00.000Z"
}
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

Rules:

- `Not Started`, `In Progress`, and `Submitted` are user-selectable.
- `Overdue` is derived when `due_date < now` and status is not `Submitted`.
- `submission_link` is optional.
- If `submission_link` is provided, it must be a valid HTTP/HTTPS URL.

### 6.4. Reminder

```json
{
  "id": "reminder-uuid",
  "deadline_id": "deadline-uuid",
  "reminder_time": "2026-06-19T23:59:00+07:00",
  "offset_days": 1,
  "channel": "in_app",
  "sent_status": "pending",
  "deadline": {
    "id": "deadline-uuid",
    "title": "Submit project report",
    "due_date": "2026-06-20T23:59:00+07:00"
  },
  "created_at": "2026-06-10T08:00:00.000Z"
}
```

Allowed reminder channels:

```text
in_app
email
```

Allowed sent status values:

```text
pending
sent
failed
```

MVP channel:

- `in_app` is required.
- `email` is optional future work unless approved.

---

## 7. Validation Rules

### 7.1. Course

| Field | Required | Rule |
|---|---:|---|
| `course_name` | Yes | Non-empty, max 120 characters |
| `course_code` | No | Max 50 characters |
| `semester` | No | Max 50 characters |

A user should not create duplicate course names in the same semester.

### 7.2. Deadline

| Field | Required | Rule |
|---|---:|---|
| `course_id` | Yes | UUID of course owned by current user |
| `title` | Yes | Non-empty, max 160 characters |
| `due_date` | Yes | Valid ISO 8601 datetime with `Z` or a `+/-HH:MM` UTC offset |
| `status` | No | Allowed status value |
| `priority` | No | Allowed priority value |
| `description` | No | Max 2000 characters |
| `submission_link` | No | Valid HTTP/HTTPS URL |

Defaults:

| Field | Default |
|---|---|
| `status` | `Not Started` |
| `priority` | `Medium` |

### 7.3. Reminder

| Field | Required | Rule |
|---|---:|---|
| `enabled` | Yes | Boolean |
| `reminder_offsets` | Yes when enabled | Array of offsets before due date |
| `channel` | No | `in_app` by default |

MVP reminder offsets:

```text
7
3
1
0
```

Backend converts offsets into reminder rows.

---

## 8. Endpoint Summary

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | No | Backend health check |
| GET | `/me` | Yes | Get current profile |
| GET | `/courses` | Yes | List current user's courses |
| POST | `/courses` | Yes | Create course |
| PATCH | `/courses/:id` | Yes | Update course |
| DELETE | `/courses/:id` | Yes | Delete course |
| GET | `/deadlines` | Yes | List current user's deadlines |
| POST | `/deadlines` | Yes | Create deadline |
| GET | `/deadlines/:id` | Yes | Get deadline detail |
| PATCH | `/deadlines/:id` | Yes | Update deadline, including status and `submission_link` |
| DELETE | `/deadlines/:id` | Yes | Delete deadline |
| GET | `/dashboard/weekly` | Yes | Get weekly dashboard data |
| GET | `/reminders` | Yes | List current user's reminders |
| PATCH | `/deadlines/:id/reminder` | Yes | Enable/disable reminder settings |

Do not add these MVP endpoints:

```text
Separate deadline link endpoints
POST /files
POST /uploads
```

---

## 9. Health

### 9.1. `GET /health`

Success response:

```json
{
  "ok": true,
  "data": {
    "service": "server",
    "status": "running",
    "timestamp": "2026-06-10T08:00:00.000Z"
  },
  "message": "UniDeadline Tracker API is running"
}
```

---

## 10. Auth

### 10.1. `GET /me`

Returns the current user's profile.

Success response:

```json
{
  "ok": true,
  "data": {
    "id": "user-uuid",
    "email": "student@example.com",
    "display_name": "Student Name",
    "created_at": "2026-06-10T08:00:00.000Z",
    "updated_at": "2026-06-10T08:00:00.000Z"
  },
  "message": "Current user loaded"
}
```

---

## 11. Courses

### 11.1. `GET /courses`

Query:

| Query | Default | Rule |
|---|---|---|
| `page` | `1` | Minimum 1 |
| `limit` | `20` | 1-100 |
| `q` | none | Search course name/code |
| `semester` | none | Filter semester |
| `sort_order` | `asc` | `asc` or `desc` |

Success response:

```json
{
  "ok": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "total_pages": 0
  },
  "message": "Courses loaded"
}
```

### 11.2. `POST /courses`

Request:

```json
{
  "course_name": "Software Project Management",
  "course_code": "BIT304V1",
  "semester": "SUM2026"
}
```

Success: `201 Created`

### 11.3. `PATCH /courses/:id`

Request can include any course fields. At least one valid field is required.

Success: `200 OK`

### 11.4. `DELETE /courses/:id`

MVP rule:

- If the course has deadlines, block deletion.
- Return `409 COURSE_HAS_DEADLINES`.

Success: `200 OK`

---

## 12. Deadlines

### 12.1. `GET /deadlines`

Query:

| Query | Default | Rule |
|---|---|---|
| `page` | `1` | Minimum 1 |
| `limit` | `20` | 1-100 |
| `course_id` | none | Filter by course |
| `status` | none | Allowed status |
| `priority` | none | Allowed priority |
| `from` | none | Start date |
| `to` | none | End date |
| `q` | none | Search title/description |
| `sort_by` | `due_date` | `due_date`, `created_at`, `priority`, `status` |
| `sort_order` | `asc` | `asc` or `desc` |

Success response:

```json
{
  "ok": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "total_pages": 0
  },
  "message": "Deadlines loaded"
}
```

### 12.2. `POST /deadlines`

Request:

```json
{
  "course_id": "course-uuid",
  "title": "Submit project report",
  "due_date": "2026-06-20T23:59:00+07:00",
  "status": "Not Started",
  "priority": "High",
  "description": "Submit the final project report",
  "submission_link": "https://example.com/submit"
}
```

Minimum request:

```json
{
  "course_id": "course-uuid",
  "title": "Submit project report",
  "due_date": "2026-06-20T23:59:00+07:00"
}
```

Success: `201 Created`

### 12.3. `GET /deadlines/:id`

Returns deadline detail with course and reminder summary.

Success: `200 OK`

### 12.4. `PATCH /deadlines/:id`

Request can include any deadline fields:

```json
{
  "course_id": "course-uuid",
  "title": "Submit updated project report",
  "due_date": "2026-06-21T23:59:00+07:00",
  "status": "In Progress",
  "priority": "High",
  "description": "Updated description",
  "submission_link": "https://example.com/submit"
}
```

Rules:

- At least one valid field is required.
- `course_id`, if changed, must belong to current user.
- `submission_link`, if provided, must be HTTP/HTTPS.
- If status becomes `Submitted`, pending reminders should not trigger.

Success: `200 OK`

### 12.5. `DELETE /deadlines/:id`

Deletes one deadline owned by the current user.

Success: `200 OK`

---

## 13. Dashboard

### 13.1. `GET /dashboard/weekly`

Query:

| Query | Default | Rule |
|---|---|---|
| `week_start` | current week Monday | `YYYY-MM-DD` |

Week starts on Monday and ends on Sunday.

Success response:

```json
{
  "ok": true,
  "data": {
    "week_start": "2026-06-08",
    "week_end": "2026-06-14",
    "summary": {
      "total": 8,
      "not_started": 2,
      "in_progress": 3,
      "submitted": 2,
      "overdue": 1,
      "high_priority": 3
    },
    "deadlines": []
  },
  "message": "Weekly dashboard loaded"
}
```

---

## 14. Reminders

### 14.1. `GET /reminders`

Query:

| Query | Default | Rule |
|---|---|---|
| `page` | `1` | Minimum 1 |
| `limit` | `20` | 1-100 |
| `sent_status` | none | `pending`, `sent`, `failed` |
| `from` | none | Reminder time start |
| `to` | none | Reminder time end |

Success response:

```json
{
  "ok": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "total_pages": 0
  },
  "message": "Reminders loaded"
}
```

### 14.2. `PATCH /deadlines/:id/reminder`

Enable reminders:

```json
{
  "enabled": true,
  "reminder_offsets": [7, 3, 1],
  "channel": "in_app"
}
```

Disable reminders:

```json
{
  "enabled": false
}
```

Rules:

- Backend converts offsets to reminder rows.
- If disabled, remove pending reminders for that deadline.
- Submitted deadlines should not create new reminders.
- Email reminders require SMTP env plus `EMAIL_REMINDER_ENABLED=true`.
- Manual email job trigger is dev/demo-only and requires `EMAIL_REMINDER_TRIGGER_TOKEN`.

### 14.3. `POST /reminders/process-email-now`

Dev/demo-only manual email reminder trigger.

Headers:

| Header | Rule |
|---|---|
| `Authorization` | Bearer Supabase access token |
| `x-dev-job-token` | Must match `EMAIL_REMINDER_TRIGGER_TOKEN` |

This route is not registered in production, and is not registered in development unless `EMAIL_REMINDER_TRIGGER_TOKEN` is set.

---

## 15. Gmail Integration

### 15.1. `POST /gmail/auth-url`

Returns the Google OAuth URL for the current authenticated user.

Success response:

```json
{
  "ok": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
  },
  "message": "Success"
}
```

### 15.2. `GET /gmail/callback`

Google OAuth redirect endpoint. This endpoint is public because Google redirects to it after consent. It verifies the signed OAuth state and stores the Gmail connection.

### 15.3. `GET /gmail/status`

Success response:

```json
{
  "ok": true,
  "data": {
    "connected": true,
    "connectedAt": "2026-07-06T10:00:00.000Z",
    "email": "student@example.com"
  },
  "message": "Success"
}
```

### 15.4. `POST /gmail/import`

Request:

```json
{
  "days": 7
}
```

Rules:

- `days` supports `7` or `30`; any other value falls back to `7`.
- The user must connect Gmail first.
- `GEMINI_API_KEY` must be a valid Google AI Studio Gemini API key because Gmail import uses Gemini to parse deadlines.
- The user must have at least one course before import because imported deadlines need a `course_id`.
- Imported Gmail messages are deduplicated with `deadlines.gmail_message_id`.

### 15.5. `POST /gmail/disconnect`

Deletes the current user's Gmail connection.

---

## 16. Friends and Group Tracking

These endpoints support owner-managed group project tracking. They are not real-time collaboration endpoints; project members do not automatically get cross-account access.

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/groups/overview` | Yes | List current user's friends and owned group projects |
| POST | `/groups/friends` | Yes | Add a friend by email |
| POST | `/groups/projects` | Yes | Create an owned group project |
| POST | `/groups/projects/:id/members` | Yes | Add a member to an owned project |
| POST | `/groups/projects/:id/tasks` | Yes | Create a task in an owned project |
| PATCH | `/groups/tasks/:id` | Yes | Update status/progress note of an owned project task |

Rules:

- Friends are unique by requester and email.
- Project members are unique by project and email.
- Only the project owner can manage project members and tasks.

---

## 17. Ownership and Security

Backend must:

1. Identify current user from Supabase access token.
2. Never trust `user_id` from request body.
3. Set `user_id` from the authenticated user on create.
4. Enforce user ownership for courses, deadlines, reminders.
5. Ensure deadline course belongs to current user.
6. Return `404 NOT_FOUND` for private resources missing or not owned by user.
7. Never expose secret keys, stack traces, SQL errors, or service role key.

---

## 18. Frontend Integration Rules

Frontend should:

1. Use `VITE_API_BASE_URL`.
2. Attach bearer token for protected endpoints.
3. Parse `ok`, `data`, `meta`, `message`, and `error`.
4. Show loading, empty, success, validation error, and API error states.
5. Use `submission_link` from deadline detail/list for document/submission URL.
6. Treat `401` as login/session problem.

---

## 19. MVP Boundary

Do not add these unless approved:

- Real-time multi-user collaboration
- Cross-account group member permissions
- Public member progress tracking
- Native mobile app APIs
- Full LMS/Outlook production integration
- Long-term AI risk prediction
- AI automatic detailed scheduling by hour
- Advanced admin analytics
- File upload APIs
- Multiple document/link API
