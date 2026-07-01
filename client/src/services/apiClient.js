const DEFAULT_API_BASE_URL = 'http://localhost:3001/api/v1'

const apiClientConfig = {
  getAccessToken: null,
  onUnauthorized: null,
}

export class ApiError extends Error {
  constructor({ status, code, message, details, response }) {
    super(message || 'API request failed')
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.response = response
  }
}

export function configureApiClient({ getAccessToken, onUnauthorized } = {}) {
  apiClientConfig.getAccessToken =
    typeof getAccessToken === 'function' ? getAccessToken : null
  apiClientConfig.onUnauthorized =
    typeof onUnauthorized === 'function' ? onUnauthorized : null
}

export function getApiBaseUrl() {
  return (
    import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ||
    DEFAULT_API_BASE_URL
  )
}

export function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== '') {
          searchParams.append(key, String(item))
        }
      })
      return
    }

    searchParams.set(key, String(value))
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

async function resolveAccessToken(token) {
  if (token) {
    return token
  }

  if (!apiClientConfig.getAccessToken) {
    return null
  }

  return apiClientConfig.getAccessToken()
}

async function parseJsonResponse(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new ApiError({
      status: response.status,
      code: 'INVALID_JSON',
      message: 'API returned an invalid JSON response',
    })
  }
}

function createApiError(response, payload) {
  const error = payload?.error || {}

  return new ApiError({
    status: response.status,
    code: error.code || 'API_ERROR',
    message: error.message || response.statusText || 'API request failed',
    details: error.details,
    response: payload,
  })
}

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body,
    params,
    token,
    headers = {},
    auth = true,
    signal,
  } = options

  const accessToken = auth ? await resolveAccessToken(token) : null

  if (auth && !accessToken) {
    const apiError = new ApiError({
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Please sign in to continue',
    })

    if (apiClientConfig.onUnauthorized) {
      apiClientConfig.onUnauthorized(apiError)
    }

    throw apiError
  }

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  }

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  if (accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(
    `${getApiBaseUrl()}${path}${buildQueryString(params)}`,
    {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    },
  )

  const payload = await parseJsonResponse(response)

  if (!response.ok || payload?.ok === false) {
    const apiError = createApiError(response, payload)

    if (response.status === 401 && apiClientConfig.onUnauthorized) {
      apiClientConfig.onUnauthorized(apiError)
    }

    throw apiError
  }

  return {
    data: payload?.data,
    meta: payload?.meta,
    message: payload?.message,
    ok: payload?.ok,
  }
}
