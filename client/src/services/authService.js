import { apiRequest } from './apiClient'

export async function getCurrentProfile(options = {}) {
  const response = await apiRequest('/me', options)
  return response.data
}

export async function updateProfile(data = {}, options = {}) {
  const response = await apiRequest('/me', { method: 'PATCH', body: data, ...options })
  return response.data
}
