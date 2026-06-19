import { sendError, sendSuccess } from '../utils/responses.js'
import { buildPaginationMeta, parsePagination, parseSortOrder, sanitizeSearchTerm } from '../utils/query.js'
import { validateCourseInput, normalizeOptionalText } from '../utils/validation.js'
import {
  createCourseRecord,
  deleteOwnedCourse,
  findOwnedCourses,
  updateOwnedCourse,
} from '../models/courseModel.js'
import { countOwnedDeadlinesForCourse } from '../models/deadlineModel.js'

/**
 * List all courses for current user
 * GET /api/v1/courses
 */
export async function listCourses(req, res) {
  const pagination = parsePagination(req.query)
  const sortOrder = parseSortOrder(req.query.sort_order)

  if (pagination.error) {
    return sendError(res, 400, 'INVALID_QUERY', pagination.error)
  }

  if (!sortOrder) {
    return sendError(res, 400, 'INVALID_QUERY', 'sort_order must be asc or desc')
  }

  const searchFilter = buildCourseSearchFilter(req.query.q)
  const { data, error, count } = await findOwnedCourses({
    userId: req.user.id,
    semester: req.query.semester,
    searchFilter,
    sortOrder,
    from: pagination.from,
    to: pagination.to,
  })

  if (error) {
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not load courses')
  }

  return sendSuccess(
    res,
    data || [],
    'Courses loaded',
    200,
    buildPaginationMeta(pagination.page, pagination.limit, count || 0)
  )
}

/**
 * Create a new course
 * POST /api/v1/courses
 */
export async function createCourse(req, res) {
  const details = validateCourseInput(req.body)

  if (details.length > 0) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid course input', details)
  }

  const payload = {
    user_id: req.user.id,
    course_name: String(req.body.course_name).trim(),
    course_code: normalizeOptionalText(req.body.course_code),
    semester: normalizeOptionalText(req.body.semester),
  }

  const { data, error } = await createCourseRecord(payload)

  if (error) {
    return sendError(res, 409, 'CONFLICT', 'Course could not be created')
  }

  return sendSuccess(res, data, 'Course created', 201)
}

/**
 * Update a course
 * PATCH /api/v1/courses/:id
 */
export async function updateCourse(req, res) {
  const allowedFields = ['course_name', 'course_code', 'semester']
  const hasAnyField = allowedFields.some((field) => req.body[field] !== undefined)

  if (!hasAnyField) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'At least one course field is required')
  }

  const details = validateCourseInput(req.body, true)

  if (details.length > 0) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid course input', details)
  }

  const updates = {}

  if (req.body.course_name !== undefined) {
    updates.course_name = String(req.body.course_name).trim()
  }

  if (req.body.course_code !== undefined) {
    updates.course_code = normalizeOptionalText(req.body.course_code)
  }

  if (req.body.semester !== undefined) {
    updates.semester = normalizeOptionalText(req.body.semester)
  }

  const { data, error } = await updateOwnedCourse(req.params.id, req.user.id, updates)

  if (error) {
    return sendError(res, 404, 'NOT_FOUND', 'Course was not found')
  }

  return sendSuccess(res, data, 'Course updated')
}

/**
 * Delete a course
 * DELETE /api/v1/courses/:id
 */
export async function deleteCourse(req, res) {
  const { count, error: countError } = await countOwnedDeadlinesForCourse(
    req.params.id,
    req.user.id
  )

  if (countError) {
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not check course deadlines')
  }

  if (count > 0) {
    return sendError(
      res,
      409,
      'COURSE_HAS_DEADLINES',
      'Course still has deadlines and cannot be deleted'
    )
  }

  const { data, error } = await deleteOwnedCourse(req.params.id, req.user.id)

  if (error || !data) {
    return sendError(res, 404, 'NOT_FOUND', 'Course was not found')
  }

  return sendSuccess(res, { id: data.id }, 'Course deleted')
}

/**
 * Build search filter for course name and code
 */
function buildCourseSearchFilter(value) {
  const q = sanitizeSearchTerm(value)

  if (!q) {
    return ''
  }

  return `course_name.ilike.%${q}%,course_code.ilike.%${q}%`
}
