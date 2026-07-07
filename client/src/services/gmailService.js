import { apiRequest } from './apiClient'

export async function getGmailStatus(options = {}) {
  const response = await apiRequest('/gmail/status', options)
  return response.data
}

export async function connectGmail() {
  const response = await apiRequest('/gmail/auth-url', {
    method: 'POST',
  })
  window.location.href = response.data.authUrl
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
