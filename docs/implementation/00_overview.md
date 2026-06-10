# Implementation Overview

## Purpose

This folder defines task execution rules for UniDeadline Tracker. It is designed for team members and AI Agents who need to complete assigned work without drifting from the MVP.

## Current Development Model

- `main` is the stable/baseline/demo branch.
- Each task is done on a separate branch.
- Each task should map back to one row in the assignment sheet.
- Pull Requests target `main`.
- Documentation must stay synchronized with implementation.

## Core Documents

| File | Purpose |
|---|---|
| `01_rules.md` | Scope lock, commit, verification, handoff rules |
| `02_task_template.md` | Copy/paste task template for team members or Agents |
| `handoff/current_status.md` | Current baseline status |
| `handoff/decisions.md` | Decisions that should not be re-decided by future Agents |
| `handoff/issues_backlog.md` | Issues found outside current task scope |

## Development Principle

Finish the assigned task cleanly. Do not solve unrelated problems in the same change.
