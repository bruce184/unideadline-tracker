import { sendError, sendSuccess } from '../utils/responses.js'
import { buildPaginationMeta, parsePagination, parseSortOrder, sanitizeSearchTerm, isValidIsoDateTime } from '../utils/query.js'
import { validateDeadlineInput, validateDeadlineQuery, buildDeadlineValidationError, normalizeOptionalText } from '../utils/validation.js'
import { findOwnedCourseById } from '../models/courseModel.js'
import {
  createDeadlineRecord,
  deleteOwnedDeadline,
  findOwnedDeadlineById,
  findOwnedDeadlineDetails,
  findOwnedDeadlines,
  updateOwnedDeadline,
} from '../models/deadlineModel.js'
import { deletePendingReminders } from '../models/reminderModel.js'

const ALLOWED_DEADLINE_FIELDS = [
  'course_id',
  'title',
  'due_date',
  'status',
  'priority',
  'description',
  'submission_link',
]

/**
 * List all deadlines for current user
 * GET /api/v1/deadlines
 */
export async function listDeadlines(req, res) {
  const pagination = parsePagination(req.query)
  const queryError = validateDeadlineQuery(req.query)
  const sortOrder = parseSortOrder(req.query.sort_order)
  const sortBy = req.query.sort_by || 'due_date'

  if (pagination.error) {
    return sendError(res, 400, 'INVALID_QUERY', pagination.error)
  }

  if (queryError) {
    return sendError(res, 400, 'INVALID_QUERY', queryError)
  }

  if (!sortOrder) {
    return sendError(res, 400, 'INVALID_QUERY', 'sort_order must be asc or desc')
  }

  // Validate date range
  if (!isValidIsoDateTime(req.query.from)) {
    return sendError(res, 400, 'INVALID_QUERY', 'from must be a valid ISO 8601 datetime')
  }

  if (!isValidIsoDateTime(req.query.to)) {
    return sendError(res, 400, 'INVALID_QUERY', 'to must be a valid ISO 8601 datetime')
  }

  if (req.query.from && req.query.to && new Date(req.query.from) > new Date(req.query.to)) {
    return sendError(res, 400, 'INVALID_QUERY', 'Invalid date range')
  }

  const filters = {
    ...req.query,
    q: sanitizeSearchTerm(req.query.q),
  }
  const { data, error, count } = await findOwnedDeadlines({
    userId: req.user.id,
    filters,
    sortBy,
    sortOrder,
    from: pagination.from,
    to: pagination.to,
    now: new Date().toISOString(),
  })

  if (error) {
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not load deadlines')
  }

  return sendSuccess(
    res,
    data || [],
    'Deadlines loaded',
    200,
    buildPaginationMeta(pagination.page, pagination.limit, count || 0)
  )
}

/**
 * Create a new deadline
 * POST /api/v1/deadlines
 */
export async function createDeadline(req, res) {
  const details = validateDeadlineInput(req.body)

  if (details.length > 0) {
    const validationError = buildDeadlineValidationError(details)
    return sendError(
      res,
      400,
      validationError.code,
      validationError.message,
      details
    )
  }

  const courseIsOwned = await ensureOwnedCourse(req.body.course_id, req.user.id)

  if (!courseIsOwned) {
    return sendError(res, 404, 'NOT_FOUND', 'Course was not found')
  }

  const payload = {
    user_id: req.user.id,
    course_id: req.body.course_id,
    title: String(req.body.title).trim(),
    due_date: req.body.due_date,
    status: req.body.status || 'Not Started',
    priority: req.body.priority || 'Medium',
    description: normalizeOptionalText(req.body.description),
    submission_link: normalizeOptionalText(req.body.submission_link),
  }

  const { data, error } = await createDeadlineRecord(payload)

  if (error) {
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Deadline could not be created')
  }

  return sendSuccess(res, data, 'Deadline created', 201)
}

/**
 * Get a specific deadline
 * GET /api/v1/deadlines/:id
 */
export async function getDeadline(req, res) {
  const { data, error } = await findOwnedDeadlineDetails(req.params.id, req.user.id)

  if (error) {
    return sendError(res, 404, 'NOT_FOUND', 'Deadline was not found')
  }

  return sendSuccess(res, data, 'Deadline loaded')
}

/**
 * Update a deadline
 * PATCH /api/v1/deadlines/:id
 */
export async function updateDeadline(req, res) {
  const hasAnyField = ALLOWED_DEADLINE_FIELDS.some((field) => req.body[field] !== undefined)

  if (!hasAnyField) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'At least one deadline field is required')
  }

  const details = validateDeadlineInput(req.body, true)

  if (details.length > 0) {
    const validationError = buildDeadlineValidationError(details)
    return sendError(
      res,
      400,
      validationError.code,
      validationError.message,
      details
    )
  }

  // Check if deadline exists and belongs to user
  const { data: existingDeadline, error: fetchError } = await findOwnedDeadlineById(
    req.params.id,
    req.user.id
  )

  if (fetchError || !existingDeadline) {
    return sendError(res, 404, 'NOT_FOUND', 'Deadline was not found')
  }

  // If course_id is being changed, verify it belongs to user
  if (req.body.course_id && req.body.course_id !== existingDeadline.course_id) {
    const courseIsOwned = await ensureOwnedCourse(req.body.course_id, req.user.id)

    if (!courseIsOwned) {
      return sendError(res, 404, 'NOT_FOUND', 'Course was not found')
    }
  }

  const updates = {}

  if (req.body.course_id !== undefined) {
    updates.course_id = req.body.course_id
  }

  if (req.body.title !== undefined) {
    updates.title = String(req.body.title).trim()
  }

  if (req.body.due_date !== undefined) {
    updates.due_date = req.body.due_date
  }

  if (req.body.status !== undefined) {
    updates.status = req.body.status
  }

  if (req.body.priority !== undefined) {
    updates.priority = req.body.priority
  }

  if (req.body.description !== undefined) {
    updates.description = normalizeOptionalText(req.body.description)
  }

  if (req.body.submission_link !== undefined) {
    updates.submission_link = normalizeOptionalText(req.body.submission_link)
  }

  const { data, error } = await updateOwnedDeadline(
    req.params.id,
    req.user.id,
    updates
  )

  if (error) {
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Deadline could not be updated')
  }

  if (updates.status === 'Submitted') {
    const { error: reminderError } = await deletePendingReminders(req.params.id)

    if (reminderError) {
      return sendError(
        res,
        500,
        'INTERNAL_SERVER_ERROR',
        'Could not remove pending reminders'
      )
    }
  }

  return sendSuccess(res, data, 'Deadline updated')
}

/**
 * Delete a deadline
 * DELETE /api/v1/deadlines/:id
 */
export async function deleteDeadline(req, res) {
  const { data, error } = await deleteOwnedDeadline(req.params.id, req.user.id)

  if (error || !data) {
    return sendError(res, 404, 'NOT_FOUND', 'Deadline was not found')
  }

  return sendSuccess(res, { id: data.id }, 'Deadline deleted')
}

/**
 * Helper: Check if a course belongs to the user
 */
async function ensureOwnedCourse(courseId, userId) {
  const { data, error } = await findOwnedCourseById(courseId, userId)

  return !error && data
}
