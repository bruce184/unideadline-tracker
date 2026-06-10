# Technical Decisions

Record decisions here so future developers and Agents do not re-decide them.

## D01 - Use `main` as Stable Baseline

- Decision: `main` is the stable baseline/demo branch.
- Reason: Simpler for a student team and local demo.
- Impact: PRs target `main`; no mandatory `dev` branch.

## D02 - Keep MVP Scope Small

- Decision: Build only the MVP modules listed in docs.
- Reason: Prevent scope creep and keep the project demo-ready.
- Impact: Could-have features require team approval.

## D03 - Store Submission Link on `deadlines`

- Decision: Store document/submission URL in `deadlines.submission_link`.
- Reason: MVP needs one simple link per deadline.
- Impact: Do not create `deadline_links` table or link APIs in MVP.

## D04 - Use Supabase Auth as User Identity Source

- Decision: User identity comes from Supabase Auth.
- Reason: Keeps auth consistent with Supabase PostgreSQL and RLS.
- Impact: Backend must derive `user_id` from the authenticated user.

## D05 - Keep Docs as Source of Truth

- Decision: API, schema, setup, coding rules, and workflow changes must update docs.
- Reason: Team members and Agents rely on docs to avoid guessing.
- Impact: Silent contract drift is not allowed.

## D06 - Local Demo First

- Decision: Local demo is required; online deployment is optional.
- Reason: Course project grading can be satisfied with stable local execution.
- Impact: Setup docs and local run commands are higher priority than deployment docs.
