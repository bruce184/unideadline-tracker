import { apiRequest } from './apiClient'

export function getCurrentProfile(options = {}) {
  return apiRequest('/me', options)
}
