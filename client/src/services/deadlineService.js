import { apiRequest } from './apiClient'

export function listDeadlines(params = {}, options = {}) {
  return apiRequest('/deadlines', {
    ...options,
    params,
  })
}

export function createDeadline(deadline, options = {}) {
  return apiRequest('/deadlines', {
    ...options,
    method: 'POST',
    body: deadline,
  })
}

export function getDeadline(deadlineId, options = {}) {
  return apiRequest(`/deadlines/${deadlineId}`, options)
}

export function updateDeadline(deadlineId, deadline, options = {}) {
  return apiRequest(`/deadlines/${deadlineId}`, {
    ...options,
    method: 'PATCH',
    body: deadline,
  })
}

export function deleteDeadline(deadlineId, options = {}) {
  return apiRequest(`/deadlines/${deadlineId}`, {
    ...options,
    method: 'DELETE',
  })
}

export function updateDeadlineReminder(deadlineId, reminder, options = {}) {
  return apiRequest(`/deadlines/${deadlineId}/reminder`, {
    ...options,
    method: 'PATCH',
    body: reminder,
  })
}
