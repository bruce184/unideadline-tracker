const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/+$/, '')
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const SESSION_STORAGE_KEY = 'unideadline.supabase.session'

export function hasSupabaseAuthConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

export function getStoredSession() {
  const rawSession = localStorage.getItem(SESSION_STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    const session = JSON.parse(rawSession)

    if (!session.access_token || !session.expires_at) {
      clearStoredSession()
      return null
    }

    if (session.expires_at <= Math.floor(Date.now() / 1000)) {
      clearStoredSession()
      return null
    }

    return session
  } catch {
    clearStoredSession()
    return null
  }
}

export function getStoredAccessToken() {
  return getStoredSession()?.access_token || null
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

export async function signInWithPassword({ email, password }) {
  if (!hasSupabaseAuthConfig()) {
    throw new Error('Supabase frontend environment variables are missing')
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error_description || payload.msg || 'Sign in failed')
  }

  const session = {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + Number(payload.expires_in || 0),
    user: payload.user,
  }

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  return session
}

export function signOut() {
  clearStoredSession()
}
