# AI AGENT TASK TEMPLATE - UniDeadline Tracker

## 0. Purpose of This File

This file is the main instruction file for AI-assisted development in the UniDeadline Tracker project.

A team member should be able to give an AI Agent:

1. This file: `docs/AI_AGENT_TASK_TEMPLATE.md`
2. One assigned task from the Google Sheets Dev Checklist

Then the AI Agent should understand the project context, MVP scope, coding rules, expected output, and how to help implement the assigned task without adding unrelated features.

---

## 1. How the AI Agent Must Use This File

When a team member asks you to help with a task, you must:

1. Read this file first.
2. Understand the project scope, tech stack, repository structure, and MVP limits.
3. Use the assigned task from the Dev Checklist as the main implementation target.
4. Implement only the assigned task.
5. Do not add unrelated features.
6. Do not silently change API contract or database schema.
7. If a required API/schema/doc change is needed, clearly say what must be updated.
8. After implementation, report:
   - Files created or updated
   - What was implemented
   - How to run locally
   - How to test
   - Any assumptions, blockers, or TODOs

When needed, also inspect these project documents:

- `docs/README_SETUP.md`
- `docs/API_CONTRACT.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/CODING_GUIDELINES.md`

This file is the entry point. The other docs provide more detailed technical references.

---

## 2. Project Context

Project name:

```text
UniDeadline Tracker
```

Project type:

```text
Responsive Web App for students to manage courses, deadlines, submission status, weekly dashboard, reminders, and basic search/filter.
```

Main users:

```text
University students who need to track academic deadlines from different courses and sources.
```

Main goal:

```text
Help students avoid missing deadlines by centralizing courses, deadlines, status, priority, weekly dashboard, and reminders.
```

---

## 3. Tech Stack

Frontend:

```text
React + Tailwind CSS + Vite
```

Backend:

```text
Node.js + Express.js
```

Database and Authentication:

```text
Supabase PostgreSQL + Supabase Auth
```

Version control:

```text
GitHub
```

Demo strategy:

```text
Local demo is required fallback.
Online deployment is optional if time allows.
```

---

## 4. Repository Structure

Expected repository structure:

```text
unideadline-tracker/
├── client/              # React + Tailwind frontend
├── server/              # Node.js + Express backend
├── docs/                # Project documents for team and AI Agent
├── database/            # SQL schema, seed data, ERD notes
├── scripts/             # Optional helper scripts
├── .env.example         # Environment variable template
├── README.md            # Project overview
└── package.json         # Root scripts
```

Suggested frontend structure when the project grows:

```text
client/src/
├── components/
├── pages/
├── routes/
├── services/
├── hooks/
├── utils/
└── styles/
```

Suggested backend structure when the project grows:

```text
server/src/
├── config/
├── routes/
├── controllers/
├── services/
├── middleware/
├── utils/
└── index.js
```

If folders do not exist yet, create them only when needed for the assigned task.

---

## 5. MVP Scope

The MVP includes:

```text
Auth / User Account
Course Management
Deadline Management
Submission Status Tracking
Weekly Dashboard
Reminder & Priority
Search & Filter
Responsive Web App
Basic Notification / In-app Reminder
Document / Link Storage
```

Could-have features only if core MVP is stable:

```text
Email Reminder
Import PoC
Rule-based Priority Suggestion
Dark Mode
```

---

## 6. Out-of-Scope Features

Do not implement these unless the Project Manager explicitly approves:

```text
Group collaboration
Group task assignment
Public member progress tracking
Native iOS or Android app
Full LMS/Outlook production integration
Long-term AI risk prediction
AI automatic detailed scheduling by hour
Advanced admin analytics
```

If the user asks for one of these features, explain that it is out of MVP scope and should be treated as v2.0 or future scope.

---

## 7. Core Data Entities

Use these entities as the basic mental model.

### User / Profile

```text
id
email
display_name
created_at
```

### Course

```text
id
user_id
course_name
course_code
semester
created_at
updated_at
```

### Deadline

```text
id
user_id
course_id
title
due_date
status
priority
description
submission_link
created_at
updated_at
```

Allowed deadline status values:

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

### Reminder

```text
id
deadline_id
reminder_time
channel
sent_status
created_at
```

Reminder channels:

```text
in_app
email
```

MVP rule:

```text
In-app reminder first.
Email reminder only if time allows.
Submitted deadlines should not continue sending reminders.
```

### Deadline Link

```text
id
deadline_id
url
file_name
file_type
created_at
```

MVP rule:

```text
Store URL first.
File upload is optional and only if the core MVP is stable.
```

---

## 8. Core API Summary

Use `docs/API_CONTRACT.md` as the source of truth if available.

Base URL:

```text
http://localhost:3001/api/v1
```

Core endpoints:

```text
GET    /health
GET    /me

GET    /courses
POST   /courses
PATCH  /courses/:id
DELETE /courses/:id

GET    /deadlines
POST   /deadlines
GET    /deadlines/:id
PATCH  /deadlines/:id
DELETE /deadlines/:id

GET    /dashboard/weekly

GET    /reminders
PATCH  /deadlines/:id/reminder

POST   /deadlines/:id/links
DELETE /deadline-links/:id
```

Standard success response:

```json
{
  "ok": true,
  "data": {},
  "message": "Success"
}
```

Standard error response:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input"
  }
}
```

Protected endpoints should require:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 9. Task Input Format from Dev Checklist

When a team member gives you a task, they should provide this information from the Google Sheets Dev Checklist:

```text
Task ID:
Sprint:
Module:
Task:
Owner:
Priority:
Status:
Due Date:
Expected Output:
Review/Test Note:
```

If some fields are missing, infer safely from context, but mention assumptions clearly.

---

## 10. General Prompt Template for Team Members

Team members can copy this prompt when using an AI Agent:

```text
Please read docs/AI_AGENT_TASK_TEMPLATE.md first.

Then help me complete this assigned task from the Dev Checklist:

Task ID:
Sprint:
Module:
Task:
Owner:
Priority:
Status:
Due Date:
Expected Output:
Review/Test Note:

Requirements:
1.
2.
3.

Please follow the project scope and repository structure.
Do not implement anything outside the assigned task.
Tell me exactly which files to create/update and how to test locally.
```

---

## 11. AI Agent Implementation Rules

When implementing a task, follow these rules:

1. Implement only the assigned task.
2. Do not introduce heavy dependencies unless necessary.
3. Keep code simple and suitable for a student MVP.
4. Follow the existing folder structure.
5. Create folders only when needed.
6. Do not break existing local run commands.
7. Do not hard-code real credentials.
8. Do not commit `.env` or secret keys.
9. If using mock data, mark it clearly and remove it when real API is ready.
10. If backend API changes, update or mention the required update to `docs/API_CONTRACT.md`.
11. If database schema changes, update or mention the required update to `docs/DATABASE_SCHEMA.md`.
12. If setup steps change, update or mention the required update to `docs/README_SETUP.md`.

---

## 12. Required AI Agent Output Format

After completing or proposing implementation, respond using this format.

### 1. Summary

Briefly explain what was implemented.

### 2. Files Created / Updated

List exact file paths.

Example:

```text
client/src/pages/LoginPage.jsx
client/src/services/authService.js
server/src/routes/auth.routes.js
```

### 3. Implementation Notes

Explain important logic, validation, API behavior, or UI behavior.

### 4. How to Run

Provide commands to run locally.

Example:

```bash
npm run dev
```

### 5. How to Test

Provide clear test steps.

Example:

```text
1. Open http://localhost:5173
2. Go to Login page
3. Enter valid email/password
4. Confirm user is redirected to Dashboard
```

### 6. Checklist Update

Tell the member what to update in the Google Sheets Checklist:

```text
Status:
Output:
Review/Test note:
Blocker:
```

### 7. Warnings / Assumptions

Mention assumptions, missing API, missing env, missing schema, or remaining TODOs.

---

## 13. Backend Task Instructions

Use this section for backend/API tasks.

Backend stack:

```text
Node.js + Express.js + Supabase
```

Backend tasks may include:

```text
Auth middleware
Course API
Deadline API
Status tracking
Reminder logic
Document/link API
Dashboard API
```

Backend implementation should usually include:

```text
Route
Controller or handler
Service/helper if needed
Validation
Supabase query
Standard response format
Error handling
Test instructions
```

Backend rules:

1. Validate request body.
2. Protect private endpoints.
3. Ensure user can access only their own data.
4. Return standard JSON response.
5. Keep endpoint behavior aligned with `docs/API_CONTRACT.md`.
6. Do not add out-of-scope endpoints.
7. Provide Postman/Thunder Client test examples if relevant.

Backend example task prompt:

```text
Task ID: BE-003
Sprint: Sprint 1
Module: Deadline
Task: Build CRUD Deadline API
Owner: Nguyễn Hoàng Quân
Priority: Must
Status: To Do
Expected Output: Deadline endpoints

Requirements:
1. Create deadline endpoint.
2. Get user's deadlines endpoint.
3. Update deadline endpoint.
4. Delete deadline endpoint.
5. Validate title, course_id, and due_date.
6. User can only access their own deadlines.
7. Return standard JSON response.
```

---

## 14. Frontend Task Instructions

Use this section for frontend/UI tasks.

Frontend stack:

```text
React + Tailwind CSS + Vite
```

Frontend tasks may include:

```text
Login/Register UI
Course list/form
Deadline list/form
Weekly Dashboard
Filter/Search
Reminder UI
Responsive layout
Loading/error states
```

Frontend implementation should usually include:

```text
Page/component
Form state
Validation
API service call if endpoint is ready
Loading state
Error state
Empty state
Responsive Tailwind layout
Test instructions
```

Frontend rules:

1. Keep UI simple and demo-friendly.
2. Use Tailwind classes consistently.
3. Validate required fields before submit.
4. Show clear error messages.
5. Use API service functions instead of calling fetch directly everywhere when project grows.
6. Use mock data only if API is not ready, and mark it clearly.
7. Do not add unrelated screens or features.

Frontend example task prompt:

```text
Task ID: FE-003
Sprint: Sprint 1
Module: Deadline
Task: Build deadline list/form UI
Owner: Tạ Minh Thiện
Priority: Must
Status: To Do
Expected Output: Deadline UI

Requirements:
1. Create deadline list page.
2. Create add/edit deadline form.
3. Fields: title, course, due_date, status, priority, description, submission_link.
4. Validate title, course, and due_date.
5. Show loading, error, and empty states.
6. Integrate API if ready; otherwise use clearly marked mock data.
```

---

## 15. QA / Testing Task Instructions

Use this section for QA/testing tasks.

QA tasks may include:

```text
Test cases
Bug list
UAT data
Demo data
Validation scenarios
Acceptance criteria
```

QA output should usually include:

```text
Test case table
Test data
Expected result
Actual result
Status
Bug report if failed
```

QA rules:

1. Test Must-have features first.
2. Include happy path and error path.
3. Use realistic demo data.
4. Report bugs in the Bug List sheet.
5. Do not create test cases for out-of-scope v2.0 features unless asked.

QA example task prompt:

```text
Task ID: QA-001
Sprint: Sprint 1
Module: Testing & UAT
Task: Create test cases for Auth, Course, Deadline, and Status
Owner: Lê Nguyễn Quốc Toàn
Priority: Must
Status: To Do
Expected Output: Sprint 1 test cases

Requirements:
1. Write happy path test cases.
2. Write validation/error test cases.
3. Include test data.
4. Include expected result.
5. Include actual result and status fields.
```

---

## 16. PM / Documentation Task Instructions

Use this section for PM/documentation tasks.

PM/documentation tasks may include:

```text
README update
Local demo guide
Demo script
Seed data checklist
Sprint tracking
Checklist management
Scope review
```

PM/documentation output should usually include:

```text
Clear instructions
Checklist
Demo flow
Known risks
Fallback plan
```

PM documentation rules:

1. Keep content short and usable.
2. Keep scope aligned with PA02/PA03 baseline.
3. Local demo must be ready even if deployment is not ready.
4. Do not promise online deployment as mandatory.
5. Update team checklist after changes.

PM example task prompt:

```text
Task ID: PM-001
Sprint: Sprint 4
Module: Local Demo / Deploy
Task: Prepare local demo guide and demo script
Owner: Nguyễn Huy Hoàng
Priority: Must
Status: To Do
Expected Output: Local demo checklist

Requirements:
1. Explain how to run frontend and backend locally.
2. List required environment variables.
3. Prepare demo account placeholder.
4. Prepare demo flow:
   - Login
   - View weekly dashboard
   - Create course
   - Create deadline
   - Update status
   - Filter/search
   - Show reminder
5. Add fallback plan if deploy is not ready.
```

---

## 17. Tech Lead Task Instructions

Use this section for architecture, database, and integration tasks.

Tech Lead tasks may include:

```text
Database schema
API contract
Folder structure
Code review
Rule-based priority
Integration support
Local/deploy setup
```

Tech Lead rules:

1. Keep architecture simple.
2. Prioritize MVP stability over advanced design.
3. Avoid overengineering.
4. Ensure backend and frontend agree on API contract.
5. Review schema changes before implementation.
6. Keep local demo stable.

Tech Lead example task prompt:

```text
Task ID: TL-001
Sprint: Sprint 4
Module: Import PoC
Task: Create import from sample file or sample data if time allows
Owner: Nguyễn Lê Đăng Khoa
Priority: Could
Status: To Do
Expected Output: Import PoC

Requirements:
1. Use a sample file or sample JSON.
2. Map title, course, due_date, description.
3. Validate missing required fields.
4. If import is risky, document it as PoC/future enhancement.
5. Do not block core MVP.
```

---

## 18. Git Workflow for Team Members

Before starting:

```bash
git checkout dev
git pull origin dev
```

Create a branch:

```bash
git checkout -b feat/<task-name>
```

Examples:

```bash
git checkout -b feat/auth
git checkout -b feat/deadline-crud
git checkout -b feat/weekly-dashboard
```

After coding:

```bash
git status
git add .
git commit -m "feat(scope): short description"
git push -u origin feat/<task-name>
```

Then open a Pull Request:

```text
base: dev
compare: feat/<task-name>
```

Do not commit directly to `main`.

Do not commit directly to `dev` unless the Project Manager approves.

---

## 19. Conventional Commit Examples

Use this format:

```text
<type>(<scope>): <short description>
```

Examples:

```bash
git commit -m "feat(auth): add login and register UI"
git commit -m "feat(deadline): add deadline CRUD API"
git commit -m "fix(course): validate missing course name"
git commit -m "docs(api): update deadline endpoint contract"
git commit -m "test(dashboard): add weekly dashboard test cases"
git commit -m "chore(setup): update env example"
```

Allowed types:

```text
feat
fix
docs
style
refactor
test
chore
```

---

## 20. Local Run Commands

Install dependencies:

```bash
npm run install:all
```

Run both client and server:

```bash
npm run dev
```

Run client only:

```bash
npm run dev:client
```

Run server only:

```bash
npm run dev:server
```

Frontend URL:

```text
http://localhost:5173
```

Backend health check:

```text
http://localhost:3001/api/v1/health
```

---

## 21. Final Reminder for AI Agent

When helping with this project:

1. Read the assigned task carefully.
2. Implement only what is assigned.
3. Keep the project suitable for a student MVP.
4. Do not add out-of-scope features.
5. Prefer simple, working implementation over complex architecture.
6. Keep local demo stable.
7. Mention all changed files.
8. Mention how to test.
9. Mention checklist updates.
10. Mention any assumption or required follow-up.

The goal is not to build a perfect enterprise system.

The goal is to help the team complete a stable, demoable UniDeadline Tracker MVP that matches the Development Plan and Dev Checklist.