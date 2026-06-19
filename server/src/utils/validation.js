/**
 * Validation utilities for all API endpoints
 */

import { isValidIsoDateTime } from './query.js'

export const ALLOWED_STATUS = ['Not Started', 'In Progress', 'Submitted', 'Overdue']
export const USER_SELECTABLE_STATUS = ['Not Started', 'In Progress', 'Submitted']
export const ALLOWED_PRIORITY = ['High', 'Medium', 'Low']
export const ALLOWED_CHANNELS = ['in_app', 'email']
export const ALLOWED_SENT_STATUS = ['pending', 'sent', 'failed']
export const ALLOWED_OFFSETS = [7, 3, 1, 0]
export const DEFAULT_OFFSETS = [7, 3, 1]
export const ALLOWED_SORT_FIELDS = ['due_date', 'created_at', 'priority', 'status']
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUuid(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value)
}

/**
 * Normalize optional text fields
 * Converts empty strings to null
 */
export function normalizeOptionalText(value) {
  if (value === undefined || value === null) {
    return null
  }

  const trimmed = String(value).trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Validate URL is valid HTTP/HTTPS URL
 */
export function isValidUrl(value) {
  if (!value) {
    return true
  }

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Validate course input (POST and PATCH)
 */
export function validateCourseInput(body, partial = false) {
  const details = []

  if (!partial || body.course_name !== undefined) {
    const courseName = String(body.course_name || '').trim()

    if (!courseName) {
      details.push({
        field: 'course_name',
        message: 'Course name is required',
      })
    }

    if (courseName.length > 120) {
      details.push({
        field: 'course_name',
        message: 'Course name must be at most 120 characters',
      })
    }
  }

  if (body.course_code !== undefined && String(body.course_code).trim().length > 50) {
    details.push({
      field: 'course_code',
      message: 'Course code must be at most 50 characters',
    })
  }

  if (body.semester !== undefined && String(body.semester).trim().length > 50) {
    details.push({
      field: 'semester',
      message: 'Semester must be at most 50 characters',
    })
  }

  return details
}

/**
 * Validate deadline input (POST and PATCH)
 */
export function validateDeadlineInput(body, partial = false) {
  const details = []

  if (!partial || body.course_id !== undefined) {
    const courseId = typeof body.course_id === 'string' ? body.course_id.trim() : ''

    if (!courseId) {
      details.push({
        field: 'course_id',
        message: 'Course is required',
      })
    } else if (!isValidUuid(body.course_id)) {
      details.push({
        field: 'course_id',
        message: 'Course ID must be a valid UUID',
      })
    }
  }

  if (!partial || body.title !== undefined) {
    const title = String(body.title || '').trim()

    if (!title) {
      details.push({
        field: 'title',
        message: 'Title is required',
      })
    }

    if (title.length > 160) {
      details.push({
        field: 'title',
        message: 'Title must be at most 160 characters',
      })
    }
  }

  if (!partial || body.due_date !== undefined) {
    const dueDate = typeof body.due_date === 'string' ? body.due_date : ''

    if (!dueDate.trim()) {
      details.push({
        field: 'due_date',
        message: 'Due date is required',
      })
    } else if (!isValidIsoDateTime(dueDate, { allowDateOnly: false })) {
      details.push({
        field: 'due_date',
        message: 'Due date must be a valid ISO 8601 datetime with Z or a +/-HH:MM UTC offset',
      })
    }
  }

  if (body.status !== undefined && !USER_SELECTABLE_STATUS.includes(body.status)) {
    details.push({
      field: 'status',
      message: 'Status is invalid',
    })
  }

  if (body.priority !== undefined && !ALLOWED_PRIORITY.includes(body.priority)) {
    details.push({
      field: 'priority',
      message: 'Priority is invalid',
    })
  }

  if (body.description !== undefined && String(body.description).length > 2000) {
    details.push({
      field: 'description',
      message: 'Description must be at most 2000 characters',
    })
  }

  if (body.submission_link !== undefined) {
    const link = normalizeOptionalText(body.submission_link)

    if (link && !isValidUrl(link)) {
      details.push({
        field: 'submission_link',
        message: 'Submission link must be a valid HTTP/HTTPS URL',
      })
    }
  }

  return details
}

/**
 * Build error code for deadline validation
 */
export function buildDeadlineValidationError(details) {
  const hasInvalidSubmissionLink = details.some((detail) => (
    detail.field === 'submission_link'
  ))

  if (hasInvalidSubmissionLink) {
    return {
      code: 'INVALID_URL',
      message: 'Submission link must be a valid HTTP/HTTPS URL',
    }
  }

  return {
    code: 'VALIDATION_ERROR',
    message: 'Invalid deadline input',
  }
}

/**
 * Validate deadline query parameters
 */
export function validateDeadlineQuery(query) {
  if (query.course_id && !isValidUuid(query.course_id)) {
    return 'course_id must be a valid UUID'
  }

  if (query.status && !ALLOWED_STATUS.includes(query.status)) {
    return 'status is invalid'
  }

  if (query.priority && !ALLOWED_PRIORITY.includes(query.priority)) {
    return 'priority is invalid'
  }

  if (query.sort_by && !ALLOWED_SORT_FIELDS.includes(query.sort_by)) {
    return 'sort_by is invalid'
  }

  return null
}

/**
 * Validate reminder offsets
 */
export function normalizeOffsets(value) {
  if (value === undefined) {
    return DEFAULT_OFFSETS
  }

  if (!Array.isArray(value) || value.length === 0) {
    return null
  }

  const offsets = value.map((item) => Number(item))

  const hasInvalidOffset = offsets.some((item) => (
    !Number.isInteger(item) || !ALLOWED_OFFSETS.includes(item)
  ))

  if (hasInvalidOffset) {
    return null
  }

  return [...new Set(offsets)].sort((a, b) => b - a)
}

/**
 * Validate reminder query parameters
 */
export function validateReminderQuery(query) {
  if (query.sent_status && !ALLOWED_SENT_STATUS.includes(query.sent_status)) {
    return 'Invalid sent_status'
  }

  return null
}
