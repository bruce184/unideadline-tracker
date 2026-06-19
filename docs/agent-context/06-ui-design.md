# UI Design Context

## Product Feel

UniDeadline Tracker should feel clear, practical, and student-friendly. It is a repeated-use productivity app, so prioritize clarity over decoration.

## Required UI States

For user-facing screens and components, handle:

```text
Loading
Empty
Error
Success
Validation
Responsive layout
```

## Main Screens Expected in MVP

```text
Login / Auth
Dashboard / Weekly workload
Courses list and form
Deadlines list and form
Deadline detail
Status tracking
Search and filters
Reminder settings or reminder controls
```

## Form Rules

1. Required fields must be validated before submit.
2. API errors should be visible to the user.
3. Date/time values must be clear.
4. `submission_link` must be optional and HTTP/HTTPS only.
5. Destructive actions should require clear user intent.
6. Registration requires `display_name` with a maximum of 120 characters.
7. Registration passwords require at least 8 characters, one uppercase letter,
   and one number; a special character is optional for the MVP.

## Responsive Rules

1. Laptop width must be usable for demo.
2. Mobile width must remain readable and navigable.
3. Text must not overflow buttons, cards, inputs, or table cells.
4. Do not add unrelated marketing sections.

## Frontend Integration

Use `VITE_API_BASE_URL` for backend calls. Do not hardcode localhost URLs inside reusable service logic.
