import { apiRequest } from './apiClient'

export function getHealth(options = {}) {
  return apiRequest('/health', {
    ...options,
    auth: false,
  })
}
