import { demoRequest } from './demoApi'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const DEMO_FALLBACK = import.meta.env.VITE_DEMO_FALLBACK !== 'false'

async function request(path, options = {}) {
  if (!BASE_URL) {
    throw new Error('Missing VITE_API_BASE_URL')
  }

  const token = localStorage.getItem('access_token')
  let response

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch (error) {
    if (DEMO_FALLBACK) return demoRequest(path, options)
    throw error
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.ok === false) {
    if (DEMO_FALLBACK && response.status === 404) {
      return demoRequest(path, options)
    }

    const apiError = payload?.error
    throw new Error(apiError?.message || `Request failed with status ${response.status}`)
  }

  return payload?.data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
