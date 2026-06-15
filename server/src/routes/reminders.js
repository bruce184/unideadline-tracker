import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { sendError, sendSuccess } from '../utils/responses.js'

const router = express.Router()

const ALLOWED_CHANNELS = ['in_app', 'email']
const ALLOWED_SENT_STATUS = ['pending', 'sent', 'failed']
const DEFAULT_OFFSETS = [7, 3, 1]

function normalizeOffsets(value) {
  if (value === undefined) {
    return DEFAULT_OFFSETS
  }

  if (!Array.isArray(value)) {
    return null
  }

  const offsets = value.map((item) => Number(item))

  const hasInvalidOffset = offsets.some((item) => (
    !Number.isInteger(item) || item < 0 || item > 365
  ))

  if (hasInvalidOffset) {
    return null
  }

  return [...new Set(offsets)].sort((a, b) => b - a)
}

async function getOwnedDeadline(deadlineId, userId) {
  const { data, error } = await supabaseAdmin
    .from('deadlines')
    .select('id, user_id, title, due_date, status')
    .eq('id', deadlineId)
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

router.get('/', requireAuth, async (req, res) => {
  if (req.query.sent_status && !ALLOWED_SENT_STATUS.includes(req.query.sent_status)) {
    return sendError(res, 400, 'INVALID_QUERY', 'Invalid sent_status')
  }

  let query = supabaseAdmin
    .from('reminders')
    .select(`
      id,
      deadline_id,
      offsets,
      channel,
      enabled,
      sent_status,
      created_at,
      updated_at,
      deadline:deadlines!inner (
        id,
        user_id,
        title,
        due_date,
        status,
        priority
      )
    `)
    .eq('deadline.user_id', req.user.id)

  if (req.query.sent_status) {
    query = query.eq('sent_status', req.query.sent_status)
  }

  if (req.query.from) {
    query = query.gte('created_at', req.query.from)
  }

  if (req.query.to) {
    query = query.lte('created_at', req.query.to)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not load reminders')
  }

  return sendSuccess(res, data, 'Reminders loaded')
})

router.patch('/deadlines/:id/reminder', requireAuth, async (req, res) => {
  if (typeof req.body.enabled !== 'boolean') {
    return sendError(res, 400, 'VALIDATION_ERROR', 'enabled must be a boolean')
  }

  const deadline = await getOwnedDeadline(req.params.id, req.user.id)

  if (!deadline) {
    return sendError(res, 404, 'NOT_FOUND', 'Deadline was not found')
  }

  if (deadline.status === 'Submitted' && req.body.enabled) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Submitted deadlines cannot create active reminders')
  }

  const offsets = normalizeOffsets(req.body.reminder_offsets)

  if (req.body.enabled && !offsets) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'reminder_offsets must be an array of valid day offsets')
  }

  const channel = req.body.channel || 'in_app'

  if (!ALLOWED_CHANNELS.includes(channel)) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid reminder channel')
  }

  const payload = {
    deadline_id: deadline.id,
    offsets: req.body.enabled ? offsets : DEFAULT_OFFSETS,
    channel,
    enabled: req.body.enabled,
    sent_status: 'pending',
  }

  const { data: existing } = await supabaseAdmin
    .from('reminders')
    .select('id')
    .eq('deadline_id', deadline.id)
    .maybeSingle()

  let result

  if (existing) {
    result = await supabaseAdmin
      .from('reminders')
      .update(payload)
      .eq('id', existing.id)
      .select('id, deadline_id, offsets, channel, enabled, sent_status, created_at, updated_at')
      .single()
  } else {
    result = await supabaseAdmin
      .from('reminders')
      .insert(payload)
      .select('id, deadline_id, offsets, channel, enabled, sent_status, created_at, updated_at')
      .single()
  }

  if (result.error) {
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Reminder could not be saved')
  }

  return sendSuccess(res, result.data, 'Reminder updated')
})

export default router