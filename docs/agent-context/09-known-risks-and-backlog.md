# Known Risks and Backlog

## Current Baseline Risks

| Risk | Impact | Handling |
|---|---|---|
| Supabase project not fully configured yet | Auth/database work may be blocked | Treat as setup backlog until keys/schema are ready |
| RLS policy mistakes | Users may fail to query their own data or access too much | Follow `DATABASE_SCHEMA.md` and test per user |
| API/schema drift | Frontend/backend mismatch | Update `API_CONTRACT.md` and `DATABASE_SCHEMA.md` together |
| Scope creep | MVP becomes too large for the team | Use scope lock and assignment sheet |
| Secrets committed accidentally | Security issue | Keep `.env` files untracked and use `.env.example` only |

## Out-of-Scope Issue Rule

If an Agent finds an issue outside the assigned task:

1. Do not fix it silently.
2. Add it to the completion report.
3. If asked to update docs, record it in `docs/implementation/handoff/issues_backlog.md`.

## Backlog Template

```text
Date:
Found during:
File/area:
Issue:
Severity:
Suggested follow-up:
```
