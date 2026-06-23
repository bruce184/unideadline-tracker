import { apiRequest, getApiBaseUrl } from './apiClient'
import { getStoredAccessToken } from './supabaseAuthService'

export async function getGmailStatus(options = {}) {
  const response = await apiRequest('/gmail/status', options)
  return response.data
}

export async function connectGmail() {
  const accessToken = await getStoredAccessToken()
  if (!accessToken) throw new Error('Vui lòng đăng nhập lại')
  const url = `${getApiBaseUrl()}/gmail/auth?access_token=${encodeURIComponent(accessToken)}`
  window.location.href = url
}

export async function importFromGmail(days, options = {}) {
  const response = await apiRequest('/gmail/import', {
    method: 'POST',
    body: { days },
    ...options,
  })
  return response.data
}

export async function disconnectGmail(options = {}) {
  const response = await apiRequest('/gmail/disconnect', {
    method: 'POST',
    ...options,
  })
  return response.data
}