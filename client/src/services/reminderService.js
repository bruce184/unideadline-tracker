import { apiRequest } from './apiClient'

export function listReminders(params = {}, options = {}) {
  return apiRequest('/reminders', {
    ...options,
    params,
  })
}
