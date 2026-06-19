import { getSupabaseAdmin } from '../config/supabase.js'
import { sendError, sendSuccess } from '../utils/responses.js'
import { buildPaginationMeta, parsePagination, parseSortOrder, sanitizeSearchTerm, isValidIsoDateTime } from '../utils/query.js'
import { validateDeadlineInput, validateDeadlineQuery, buildDeadlineValidationError, normalizeOptionalText } from '../utils/validation.js'

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

  const supabaseAdmin = getSupabaseAdmin()

  let query = supabaseAdmin
    .from('deadlines')
    .select(`
      id,
      user_id,
      course_id,
      title,
      due_date,
      status,
      priority,
      description,
      submission_link,
      created_at,
      updated_at,
      course:courses (
        id,
        course_name,
        course_code
      )
    `, { count: 'exact' })
    .eq('user_id', req.user.id)

  query = applyDeadlineFilters(query, req.query)

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(pagination.from, pagination.to)

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

  const supabaseAdmin = getSupabaseAdmin()

  const { data, error } = await supabaseAdmin
    .from('deadlines')
    .insert(payload)
    .select(`
      id,
      user_id,
      course_id,
      title,
      due_date,
      status,
      priority,
      description,
      submission_link,
      created_at,
      updated_at
    `)
    .single()

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
  const supabaseAdmin = getSupabaseAdmin()

  const { data, error } = await supabaseAdmin
    .from('deadlines')
    .select(`
      id,
      user_id,
      course_id,
      title,
      due_date,
      status,
      priority,
      description,
      submission_link,
      created_at,
      updated_at,
      course:courses (
        id,
        course_name,
        course_code
      ),
      reminders (
        id,
        reminder_time,
        offset_days,
        channel,
        sent_status,
        created_at
      )
    `)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single()

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

  const supabaseAdmin = getSupabaseAdmin()

  // Check if deadline exists and belongs to user
  const { data: existingDeadline, error: fetchError } = await supabaseAdmin
    .from('deadlines')
    .select('id, user_id, course_id')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single()

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

  const { data, error } = await supabaseAdmin
    .from('deadlines')
    .update(updates)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select(`
      id,
      user_id,
      course_id,
      title,
      due_date,
      status,
      priority,
      description,
      submission_link,
      created_at,
      updated_at
    `)
    .single()

  if (error) {
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Deadline could not be updated')
  }

  return sendSuccess(res, data, 'Deadline updated')
}

/**
 * Delete a deadline
 * DELETE /api/v1/deadlines/:id
 */
export async function deleteDeadline(req, res) {
  const supabaseAdmin = getSupabaseAdmin()

  const { data, error } = await supabaseAdmin
    .from('deadlines')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select('id')
    .single()

  if (error || !data) {
    return sendError(res, 404, 'NOT_FOUND', 'Deadline was not found')
  }

  return sendSuccess(res, { id: data.id }, 'Deadline deleted')
}

/**
 * Helper: Check if a course belongs to the user
 */
async function ensureOwnedCourse(courseId, userId) {
  const supabaseAdmin = getSupabaseAdmin()

  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('user_id', userId)
    .single()

  return !error && data
}

/**
 * Helper: Apply filters to deadline query
 */
function applyDeadlineFilters(query, reqQuery) {
  if (reqQuery.course_id) {
    query = query.eq('course_id', reqQuery.course_id)
  }

  if (reqQuery.status) {
    query = query.eq('status', reqQuery.status)
  }

  if (reqQuery.priority) {
    query = query.eq('priority', reqQuery.priority)
  }

  if (reqQuery.from) {
    query = query.gte('due_date', reqQuery.from)
  }

  if (reqQuery.to) {
    query = query.lte('due_date', reqQuery.to)
  }

  if (reqQuery.q) {
    const q = sanitizeSearchTerm(reqQuery.q)
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
    }
  }

  return query
}
