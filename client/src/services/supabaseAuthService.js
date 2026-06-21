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
      return null
    }

    return session
  } catch {
    clearStoredSession()
    return null
  }
}

let activeRefreshPromise = null

export async function refreshSession(refreshToken) {
  if (activeRefreshPromise) {
    return activeRefreshPromise
  }

  activeRefreshPromise = (async () => {
    try {
      if (!hasSupabaseAuthConfig()) {
        throw new Error('Supabase frontend environment variables are missing')
      }

      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload.error_description || payload.msg || 'Refresh token failed')
      }

      const session = {
        access_token: payload.access_token,
        refresh_token: payload.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + Number(payload.expires_in || 0),
        user: payload.user,
      }

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
      return session
    } finally {
      activeRefreshPromise = null
    }
  })()

  return activeRefreshPromise
}

export async function getOrRefreshSession() {
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

    const now = Math.floor(Date.now() / 1000)
    if (session.expires_at - now < 60) {
      if (session.refresh_token) {
        try {
          return await refreshSession(session.refresh_token)
        } catch (err) {
          console.error('Failed to refresh session:', err)
          clearStoredSession()
          return null
        }
      } else {
        clearStoredSession()
        return null
      }
    }

    return session
  } catch {
    clearStoredSession()
    return null
  }
}

export async function getStoredAccessToken() {
  const session = await getOrRefreshSession()
  return session?.access_token || null
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

export async function signUp({ email, password, data }) {
  if (!hasSupabaseAuthConfig()) {
    throw new Error('Supabase frontend environment variables are missing')
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, data }),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error_description || payload.msg || 'Sign up failed')
  }

  return payload
}

export async function sendResetPasswordEmail(email) {
  if (!hasSupabaseAuthConfig()) {
    throw new Error('Supabase frontend environment variables are missing')
  }

  const redirectTo = `${window.location.origin}/reset-password`
  const response = await fetch(`${SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error_description || payload.msg || 'Gửi yêu cầu khôi phục thất bại')
  }

  return payload
}

export async function fetchUserData(accessToken) {
  if (!hasSupabaseAuthConfig()) {
    throw new Error('Supabase frontend environment variables are missing')
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error_description || payload.msg || 'Không thể lấy thông tin người dùng')
  }

  return payload
}

export async function updateUserPassword(accessToken, newPassword) {
  if (!hasSupabaseAuthConfig()) {
    throw new Error('Supabase frontend environment variables are missing')
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'PUT',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password: newPassword }),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error_description || payload.msg || 'Đổi mật khẩu thất bại')
  }

  return payload
}
