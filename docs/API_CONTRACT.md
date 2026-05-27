# API CONTRACT - UniDeadline Tracker

## 1. Purpose

This file defines the API contract between frontend and backend.

Frontend and backend must update this file when endpoint behavior changes.

The purpose is to avoid mismatch between UI, API, and database.

## 2. Base URL

Local backend:

```text
http://localhost:3001/api/v1
```

Optional deployed backend:

```text
https://your-backend-url/api/v1
```

## 3. Authentication

Protected endpoints require a bearer token from Supabase Auth.

Header format:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

## 4. Standard Success Response

```json
{
  "ok": true,
  "data": {},
  "message": "Success"
}
```

## 5. Standard Error Response

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input"
  }
}
```

## 6. Common Status Codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 500 | Internal server error |

## 7. Core Endpoints

### 7.1. Health Check

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Check whether backend API is running |

Example response:

```json
{
  "ok": true,
  "message": "UniDeadline Tracker API is running",
  "service": "server",
  "timestamp": "2026-05-22T00:00:00.000Z"
}
```

---

## 7.2. Auth / Current User

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/me` | Yes | Get current logged-in user/profile |

Example response:

```json
{
  "ok": true,
  "data": {
    "id": "user-id",
    "email": "student@example.com",
    "display_name": "Student Name"
  },
  "message": "Current user loaded"
}
```

---

## 7.3. Courses

### Get courses

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/courses` | Yes | Get user's courses |

Example response:

```json
{
  "ok": true,
  "data": [
    {
      "id": "course-id",
      "course_name": "Software Project Management",
      "course_code": "BIT304V1",
      "semester": "SUM2026"
    }
  ],
  "message": "Courses loaded"
}
```

### Create course

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/courses` | Yes | Create a course |

Request body:

```json
{
  "course_name": "Software Project Management",
  "course_code": "BIT304V1",
  "semester": "SUM2026"
}
```

Validation:

- `course_name` is required
- `course_code` is optional
- `semester` is optional

### Update course

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| PATCH | `/courses/:id` | Yes | Update a course |

### Delete course

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| DELETE | `/courses/:id` | Yes | Delete a course |

Important rule:

- User can only access their own courses.
- If a course has related deadlines, backend should warn or prevent deletion depending on implementation decision.

---

## 7.4. Deadlines

### Get deadlines

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/deadlines` | Yes | Get user's deadlines |

Possible query parameters:

| Query | Example | Description |
|---|---|---|
| `course_id` | `/deadlines?course_id=abc` | Filter by course |
| `status` | `/deadlines?status=In Progress` | Filter by status |
| `priority` | `/deadlines?priority=High` | Filter by priority |
| `from` | `/deadlines?from=2026-06-01` | Start date |
| `to` | `/deadlines?to=2026-06-30` | End date |
| `q` | `/deadlines?q=report` | Search keyword |

### Create deadline

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/deadlines` | Yes | Create a deadline |

Request body:

```json
{
  "course_id": "course-id",
  "title": "Submit project report",
  "due_date": "2026-06-20T23:59:00+07:00",
  "status": "Not Started",
  "priority": "High",
  "description": "Submit the final project report",
  "submission_link": "https://example.com/submit"
}
```

Required fields:

- `course_id`
- `title`
- `due_date`

Optional fields:

- `status`
- `priority`
- `description`
- `submission_link`

### Get deadline detail

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/deadlines/:id` | Yes | Get deadline detail |

### Update deadline

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| PATCH | `/deadlines/:id` | Yes | Update deadline |

### Delete deadline

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| DELETE | `/deadlines/:id` | Yes | Delete deadline |

Important rules:

- User can only access their own deadlines.
- Deadline must belong to a course.
- Overdue can be computed when `due_date < now` and status is not `Submitted`.

---

## 7.5. Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard/weekly` | Yes | Get weekly deadline dashboard |

Possible query:

```text
/dashboard/weekly?week_start=2026-06-10
```

Example response:

```json
{
  "ok": true,
  "data": {
    "week_start": "2026-06-10",
    "week_end": "2026-06-16",
    "deadlines": []
  },
  "message": "Weekly dashboard loaded"
}
```

---

## 7.6. Reminders

### Get reminders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/reminders` | Yes | Get reminder list |

### Update reminder setting

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| PATCH | `/deadlines/:id/reminder` | Yes | Enable or disable reminder |

Request body:

```json
{
  "enabled": true,
  "reminder_offsets": [7, 3, 1],
  "channel": "in_app"
}
```

MVP rule:

- In-app reminder first.
- Email reminder only if time allows.
- Submitted deadlines should not continue sending reminders.

---

## 7.7. Document / Link

### Add link

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/deadlines/:id/links` | Yes | Add document or submission link |

Request body:

```json
{
  "url": "https://example.com/document",
  "file_name": "Project Report",
  "file_type": "link"
}
```

### Delete link

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| DELETE | `/deadline-links/:id` | Yes | Delete document or submission link |

MVP rule:

- Store URL first.
- File upload is optional and only if stable.

---

## 8. API Status Tracking

Use the Google Sheets checklist to track each API status:

- Not Started
- Backend Done
- FE Integrated
- QA Passed
- Changed

## 9. MVP Scope Rule

Do not add the following into MVP endpoints unless approved:

- Group collaboration
- Group task assignment
- Native mobile app
- Full LMS/Outlook production integration
- Long-term AI risk prediction
- Advanced admin analytics