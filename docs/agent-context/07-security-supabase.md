# Security and Supabase Context

## Supabase Project Setup

Recommended project options:

```text
[x] Enable Data API
[ ] Automatically expose new tables
[x] Enable automatic RLS
```

## Environment Rules

Frontend may use:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_BASE_URL
```

Backend may use:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
GOOGLE_OAUTH_STATE_SECRET
EMAIL_REMINDER_ENABLED
EMAIL_HOST
EMAIL_PORT
EMAIL_USER
EMAIL_PASS
EMAIL_FROM
EMAIL_REMINDER_TRIGGER_TOKEN
PORT
CLIENT_ORIGIN
NODE_ENV
```

## Secret Rules

Never commit:

```text
.env
Supabase service role key
Passwords
Tokens
Google OAuth secrets
Gmail app passwords
Real user data
Private credentials
```

`SUPABASE_SERVICE_ROLE_KEY` must stay server-side only.

## Auth Rules

1. Protected endpoints require a Supabase access token.
2. Missing token returns `401`.
3. Invalid token returns `401`.
4. Authenticated users can only access their own data.
5. Backend must not trust `user_id` from request bodies.

## RLS Rules

1. Enable RLS for app tables.
2. Policies must enforce owner-based access.
3. Seed data must be fake.
4. If RLS blocks a legitimate query, fix the policy or backend ownership logic; do not bypass security silently.
