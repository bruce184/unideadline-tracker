import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { sendError, sendSuccess } from '../utils/responses.js'



const router = express.Router()

function normalizeOptionalText(value) {
  if (value === undefined || value === null) {
    return null
  }

  const trimmed = String(value).trim()
  return trimmed.length > 0 ? trimmed : null
}

function validateCourseInput(body, partial = false) {
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

router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('id, user_id, course_name, course_code, semester, created_at, updated_at')
    .eq('user_id', req.user.id)
    .order('course_name', { ascending: true })

  if (error) {
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not load courses')
  }

  return sendSuccess(res, data, 'Courses loaded')
})

router.post('/', requireAuth, async (req, res) => {
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

  const { data, error } = await supabaseAdmin
    .from('courses')
    .insert(payload)
    .select('id, user_id, course_name, course_code, semester, created_at, updated_at')
    .single()

  if (error) {
    return sendError(res, 409, 'CONFLICT', 'Course could not be created')
  }

  return sendSuccess(res, data, 'Course created', 201)
})

router.patch('/:id', requireAuth, async (req, res) => {
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

  const { data, error } = await supabaseAdmin
    .from('courses')
    .update(updates)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select('id, user_id, course_name, course_code, semester, created_at, updated_at')
    .single()

  if (error) {
    return sendError(res, 404, 'NOT_FOUND', 'Course was not found')
  }

  return sendSuccess(res, data, 'Course updated')
})

router.delete('/:id', requireAuth, async (req, res) => {
  const { count, error: countError } = await supabaseAdmin
    .from('deadlines')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', req.params.id)
    .eq('user_id', req.user.id)

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

  const { data, error } = await supabaseAdmin
    .from('courses')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select('id')
    .single()

  if (error || !data) {
    return sendError(res, 404, 'NOT_FOUND', 'Course was not found')
  }

  return sendSuccess(res, { id: data.id }, 'Course deleted')
})

export default router