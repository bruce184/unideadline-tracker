import { apiRequest } from './apiClient'

export async function getCurrentProfile(options = {}) {
  const response = await apiRequest('/me', options)
  return response.data
}
