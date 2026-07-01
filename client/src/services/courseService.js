import { apiRequest } from './apiClient'

export function listCourses(params = {}, options = {}) {
  return apiRequest('/courses', {
    ...options,
    params,
  })
}

export function createCourse(course, options = {}) {
  return apiRequest('/courses', {
    ...options,
    method: 'POST',
    body: course,
  })
}

export function updateCourse(courseId, course, options = {}) {
  return apiRequest(`/courses/${courseId}`, {
    ...options,
    method: 'PATCH',
    body: course,
  })
}

export function deleteCourse(courseId, options = {}) {
  return apiRequest(`/courses/${courseId}`, {
    ...options,
    method: 'DELETE',
  })
}
