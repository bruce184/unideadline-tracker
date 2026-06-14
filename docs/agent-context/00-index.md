# Agent Context Index

## Purpose

This directory gives AI Agents and team members a compact, task-oriented view of UniDeadline Tracker. It prevents agents from guessing architecture, scope, data model, API behavior, or file placement.

## Start Here

Read in this order:

1. `AGENTS.md`
2. `docs/agent-context/00-index.md`
3. `docs/DEV_WORKFLOW.md`
4. The context file that matches the task type
5. The assignment row from the team sheet
6. `docs/prompts/00-agent-router.md` when using role-based Agent prompts

## Context Files

| File | Use When |
|---|---|
| `01-system-overview.md` | You need the project goal, MVP scope, and product boundaries |
| `02-project-structure.md` | You need to know where files belong |
| `03-architecture.md` | You need frontend/backend/data boundaries |
| `04-feature-scope.md` | You need allowed, optional, and out-of-scope features |
| `05-data-api-contract.md` | You touch API, database, Supabase, or shared data shapes |
| `06-ui-design.md` | You touch frontend screens, forms, states, or responsive UI |
| `07-security-supabase.md` | You touch auth, RLS, keys, env, or ownership rules |
| `08-agent-task-playbook.md` | You need the standard task execution checklist |
| `09-known-risks-and-backlog.md` | You find issues outside current scope |

## Prompt Pack

| File | Use When |
|---|---|
| `docs/prompts/00-agent-router.md` | Parent prompt that routes Agents by work type |
| `docs/prompts/01-common-rules.md` | Common local-state, scope, security, and CLI timeout rules |
| `docs/prompts/02-dev-feature.md` | Assigned feature or module implementation |
| `docs/prompts/03-bugfix.md` | Bug investigation and fix |
| `docs/prompts/04-refactor.md` | Behavior-preserving refactor |
| `docs/prompts/05-code-review.md` | Local branch or PR review |
| `docs/prompts/06-qa-demo.md` | QA, UAT, and local demo verification |

Prompt files define Agent workflow. They do not replace the source-of-truth docs.

## Required Source-of-Truth Files

| Area | Source of Truth |
|---|---|
| Local setup and Supabase setup | `docs/README_SETUP.md` |
| API endpoints and response format | `docs/API_CONTRACT.md` |
| Database tables, constraints, RLS | `docs/DATABASE_SCHEMA.md` |
| Coding, branch, commit, PR rules | `docs/CODING_GUIDELINES.md` |
| Team/Agent workflow | `docs/DEV_WORKFLOW.md` |

## Core Rule

If a task conflicts with the source-of-truth docs, stop and report the conflict. Do not invent a new behavior.
