import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { sendError, sendSuccess } from '../utils/responses.js'
import {
  buildPaginationMeta,
  parsePagination,
  parseSortOrder,
  sanitizeSearchTerm,
} from '../utils/query.js'

const router = express.Router()

const ALLOWED_STATUS = ['Not Started', 'In Progress', 'Submitted', 'Overdue']
const ALLOWED_PRIORITY = ['High', 'Medium', 'Low']
const ALLOWED_SORT_FIELDS = ['due_date', 'created_at', 'priority', 'status']

function normalizeOptionalText(value) {
  if (value === undefined || value === null) {
    return null
  }

  const trimmed = String(value).trim()
  return trimmed.length > 0 ? trimmed : null
}

function isValidUrl(value) {
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

function validateDeadlineInput(body, partial = false) {
  const details = []

  if (!partial || body.course_id !== undefined) {
    if (!String(body.course_id || '').trim()) {
      details.push({
        field: 'course_id',
        message: 'Course is required',
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
    const dueDate = String(body.due_date || '').trim()

    if (!dueDate) {
      details.push({
        field: 'due_date',
        message: 'Due date is required',
      })
    } else if (Number.isNaN(Date.parse(dueDate))) {
      details.push({
        field: 'due_date',
        message: 'Due date must be a valid ISO 8601 datetime',
      })
    }
  }

  if (body.status !== undefined && !ALLOWED_STATUS.includes(body.status)) {
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

async function ensureOwnedCourse(courseId, userId) {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('user_id', userId)
    .single()

  return !error && data
}

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

router.get('/', requireAuth, async (req, res) => {
  const pagination = parsePagination(req.query)
  const sortOrder = parseSortOrder(req.query.sort_order)
  const sortBy = req.query.sort_by || 'due_date'

  if (pagination.error) {
    return sendError(res, 400, 'INVALID_QUERY', pagination.error)
  }

  if (!sortOrder) {
    return sendError(res, 400, 'INVALID_QUERY', 'sort_order must be asc or desc')
  }

  if (!ALLOWED_SORT_FIELDS.includes(sortBy)) {
    return sendError(res, 400, 'INVALID_QUERY', 'sort_by is invalid')
  }

  if (req.query.from && req.query.to && new Date(req.query.from) > new Date(req.query.to)) {
    return sendError(res, 400, 'INVALID_QUERY', 'Invalid date range')
  }

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
})

router.post('/', requireAuth, async (req, res) => {
  const details = validateDeadlineInput(req.body)

  if (details.length > 0) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid deadline input', details)
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
})

router.get('/:id', requireAuth, async (req, res) => {
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
})

router.patch('/:id', requireAuth, async (req, res) => {
  const allowedFields = [
    'course_id',
    'title',
    'due_date',
    'status',
    'priority',
    'description',
    'submission_link',
  ]
  const hasAnyField = allowedFields.some((field) => req.body[field] !== undefined)

  if (!hasAnyField) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'At least one deadline field is required')
  }

  const details = validateDeadlineInput(req.body, true)

  if (details.length > 0) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid deadline input', details)
  }

  if (req.body.course_id !== undefined) {
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
    return sendError(res, 404, 'NOT_FOUND', 'Deadline was not found')
  }

  if (updates.status === 'Submitted') {
    const { error: reminderError } = await supabaseAdmin
      .from('reminders')
      .delete()
      .eq('deadline_id', req.params.id)
      .eq('sent_status', 'pending')

    if (reminderError) {
      return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not remove pending reminders')
    }
  }

  return sendSuccess(res, data, 'Deadline updated')
})

router.delete('/:id', requireAuth, async (req, res) => {
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
})

export default router
