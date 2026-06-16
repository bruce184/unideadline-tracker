import { apiRequest } from './apiClient'

export function getWeeklyDashboard(params = {}, options = {}) {
  return apiRequest('/dashboard/weekly', {
    ...options,
    params,
  })
}
