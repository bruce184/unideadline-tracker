import { apiRequest } from './apiClient'

export function getFriendsGroupsOverview(options = {}) {
  return apiRequest('/groups/overview', options)
}

export function createFriend(friend, options = {}) {
  return apiRequest('/groups/friends', {
    ...options,
    method: 'POST',
    body: friend,
  })
}

export function createGroupProject(project, options = {}) {
  return apiRequest('/groups/projects', {
    ...options,
    method: 'POST',
    body: project,
  })
}

export function addGroupProjectMember(projectId, member, options = {}) {
  return apiRequest(`/groups/projects/${projectId}/members`, {
    ...options,
    method: 'POST',
    body: member,
  })
}

export function createGroupTask(projectId, task, options = {}) {
  return apiRequest(`/groups/projects/${projectId}/tasks`, {
    ...options,
    method: 'POST',
    body: task,
  })
}

export function updateGroupTask(taskId, task, options = {}) {
  return apiRequest(`/groups/tasks/${taskId}`, {
    ...options,
    method: 'PATCH',
    body: task,
  })
}
