# AI AGENT TASK TEMPLATE - UniDeadline Tracker

## 1. Purpose

Use this template when asking an AI Agent to help with a development task.

The goal is to give the agent enough project context so it does not implement unrelated features or break MVP scope.

## 2. Project Context

```text
You are helping develop UniDeadline Tracker.

Project context:
- Frontend: React + Tailwind CSS
- Backend: Node.js + Express.js
- Database/Auth: Supabase
- Repository: monorepo with client/ and server/
- MVP scope: Auth, Course, Deadline, Status, Weekly Dashboard, Reminder, Search/Filter, Document/Link
- Out of scope: group collaboration, group task assignment, native mobile app, full LMS/Outlook integration, long-term AI prediction

Important documents:
- docs/README_SETUP.md
- docs/API_CONTRACT.md
- docs/DATABASE_SCHEMA.md
- docs/CODING_GUIDELINES.md
```

## 3. General Template

Copy this template and fill in the task information.

```text
You are helping develop UniDeadline Tracker.

Project context:
- Frontend: React + Tailwind CSS
- Backend: Node.js + Express.js
- Database/Auth: Supabase
- Repository: monorepo with client/ and server/
- MVP scope: Auth, Course, Deadline, Status, Weekly Dashboard, Reminder, Search/Filter, Document/Link
- Out of scope: group collaboration, group task assignment, native mobile app, full LMS/Outlook integration, long-term AI prediction

Task information:
- Task ID:
- Module:
- Sprint:
- Owner:
- Priority:
- Current status:

Related docs:
- docs/API_CONTRACT.md
- docs/DATABASE_SCHEMA.md
- docs/CODING_GUIDELINES.md
- docs/README_SETUP.md

Goal:
[Describe what needs to be built]

Requirements:
1.
2.
3.

Expected output:
- Files to create/update
- Code implementation
- Validation logic
- Example request/response if backend
- UI behavior if frontend
- How to test locally

Constraints:
- Follow current folder structure.
- Do not introduce unrelated features.
- Do not change API contract without mentioning it.
- Keep code simple and suitable for a student MVP.
- Do not add group collaboration or native mobile features.
```

## 4. Backend Example

```text
You are helping develop UniDeadline Tracker.

Task information:
- Task ID: BE-003
- Module: Deadline
- Sprint: Sprint 1
- Owner: Nguyễn Hoàng Quân
- Priority: Must
- Current status: To Do

Related docs:
- docs/API_CONTRACT.md
- docs/DATABASE_SCHEMA.md
- docs/CODING_GUIDELINES.md
- docs/README_SETUP.md

Goal:
Build CRUD Deadline API.

Requirements:
1. Create endpoint to add a deadline.
2. Create endpoint to get user's deadlines.
3. Create endpoint to update a deadline.
4. Create endpoint to delete a deadline.
5. Deadline must include title, course_id, due_date, status, priority, description, and submission_link.
6. Validate missing title, course_id, and due_date.
7. User can only access their own deadlines.
8. Return standard JSON response.

Expected output:
- Express route files
- Controller/service logic
- Supabase query
- Example request/response
- How to test with Postman or Thunder Client

Constraints:
- Do not implement group task assignment.
- Do not implement LMS integration.
- Keep implementation simple for MVP.
```

## 5. Frontend Example

```text
You are helping develop UniDeadline Tracker.

Task information:
- Task ID: FE-003
- Module: Deadline
- Sprint: Sprint 1
- Owner: Tạ Minh Thiện
- Priority: Must
- Current status: To Do

Related docs:
- docs/API_CONTRACT.md
- docs/DATABASE_SCHEMA.md
- docs/CODING_GUIDELINES.md
- docs/README_SETUP.md

Goal:
Build deadline list and deadline form UI.

Requirements:
1. Create deadline list page.
2. Create add/edit deadline form.
3. Fields: title, course, due_date, status, priority, description, submission_link.
4. Validate required fields before submit.
5. Show loading and error states.
6. Integrate with backend API if endpoint is ready.
7. Use mock data only if API is not ready, and mark it clearly.

Expected output:
- React page/component files
- API service function if needed
- Basic Tailwind styling
- Responsive layout
- How to test locally

Constraints:
- Do not hard-code data permanently.
- Do not add unrelated features.
- Keep UI simple and demo-friendly.
```

## 6. QA Example

```text
You are helping test UniDeadline Tracker.

Task information:
- Task ID: QA-001
- Module: Testing & UAT
- Sprint: Sprint 1
- Owner: Lê Nguyễn Quốc Toàn
- Priority: Must

Goal:
Create test cases for Auth, Course, Deadline, and Status Tracking.

Requirements:
1. Write happy path test cases.
2. Write validation/error test cases.
3. Include test data.
4. Include expected result.
5. Include actual result and status fields.

Expected output:
- Test case table
- Bug report template
- UAT checklist
- Suggested demo data

Constraints:
- Keep test cases aligned with MVP.
- Do not add test cases for out-of-scope features.
```

## 7. PM / Documentation Example

```text
You are helping prepare project documentation for UniDeadline Tracker.

Task information:
- Task ID: PM-001
- Module: Local Demo / Deploy
- Sprint: Sprint 4
- Owner: Nguyễn Huy Hoàng
- Priority: Must

Goal:
Prepare local demo guide and demo script.

Requirements:
1. Explain how to run frontend and backend locally.
2. List required environment variables.
3. Prepare demo account information placeholder.
4. Prepare demo flow:
   - Login
   - View weekly dashboard
   - Create course
   - Create deadline
   - Update status
   - Filter/search
   - Show reminder
5. Add fallback plan if deploy is not ready.

Expected output:
- Local demo guide
- Demo script
- Troubleshooting notes

Constraints:
- Local demo is required fallback.
- Online deployment is optional if time allows.
```

## 8. Final Reminder for AI Agent

When generating code:

- Follow the current folder structure.
- Keep code simple and readable.
- Add comments only when helpful.
- Do not introduce heavy dependencies without explanation.
- Do not implement out-of-scope features.
- Mention files changed.
- Mention how to run and test.