import express from 'express'
import { getSupabaseAdmin } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { sendError, sendSuccess } from '../utils/responses.js'
import { buildPaginationMeta, parsePagination } from '../utils/query.js'

const router = express.Router()
const deadlineReminderRoutes = express.Router()

const ALLOWED_CHANNELS = ['in_app', 'email']
const ALLOWED_SENT_STATUS = ['pending', 'sent', 'failed']
const ALLOWED_OFFSETS = [7, 3, 1, 0]
const DEFAULT_OFFSETS = [7, 3, 1]
const DAY_IN_MS = 24 * 60 * 60 * 1000

function normalizeOffsets(value) {
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

async function getOwnedDeadline(deadlineId, userId) {
  const supabaseAdmin = getSupabaseAdmin()

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

function buildReminderRows(deadline, offsets, channel) {
  const dueDateMs = new Date(deadline.due_date).getTime()

  return offsets.map((offsetDays) => ({
    deadline_id: deadline.id,
    reminder_time: new Date(dueDateMs - offsetDays * DAY_IN_MS).toISOString(),
    offset_days: offsetDays,
    channel,
    sent_status: 'pending',
  }))
}

router.get('/', requireAuth, async (req, res) => {
  const pagination = parsePagination(req.query)

  if (pagination.error) {
    return sendError(res, 400, 'INVALID_QUERY', pagination.error)
  }

  if (req.query.sent_status && !ALLOWED_SENT_STATUS.includes(req.query.sent_status)) {
    return sendError(res, 400, 'INVALID_QUERY', 'Invalid sent_status')
  }

  const supabaseAdmin = getSupabaseAdmin()

  let query = supabaseAdmin
    .from('reminders')
    .select(`
      id,
      deadline_id,
      reminder_time,
      offset_days,
      channel,
      sent_status,
      created_at,
      deadline:deadlines!inner (
        id,
        user_id,
        title,
        due_date
      )
    `, { count: 'exact' })
    .eq('deadline.user_id', req.user.id)

  if (req.query.sent_status) {
    query = query.eq('sent_status', req.query.sent_status)
  }

  if (req.query.from) {
    query = query.gte('reminder_time', req.query.from)
  }

  if (req.query.to) {
    query = query.lte('reminder_time', req.query.to)
  }

  const { data, error, count } = await query
    .order('reminder_time', { ascending: true })
    .range(pagination.from, pagination.to)

  if (error) {
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not load reminders')
  }

  return sendSuccess(
    res,
    data || [],
    'Reminders loaded',
    200,
    buildPaginationMeta(pagination.page, pagination.limit, count || 0)
  )
})

deadlineReminderRoutes.patch('/deadlines/:id/reminder', requireAuth, async (req, res) => {
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

  const channel = req.body.channel || 'in_app'

  if (!ALLOWED_CHANNELS.includes(channel)) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid reminder channel')
  }

  const supabaseAdmin = getSupabaseAdmin()

  if (!req.body.enabled) {
    const { error } = await supabaseAdmin
      .from('reminders')
      .delete()
      .eq('deadline_id', deadline.id)
      .eq('sent_status', 'pending')

    if (error) {
      return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Reminder could not be disabled')
    }

    return sendSuccess(
      res,
      {
        deadline_id: deadline.id,
        enabled: false,
        reminder_offsets: [],
      },
      'Reminder updated'
    )
  }

  const offsets = normalizeOffsets(req.body.reminder_offsets)

  if (!offsets) {
    return sendError(
      res,
      400,
      'VALIDATION_ERROR',
      'reminder_offsets must be a non-empty array of valid MVP offsets'
    )
  }

  const reminderRows = buildReminderRows(deadline, offsets, channel)

  const { error: deleteError } = await supabaseAdmin
    .from('reminders')
    .delete()
    .eq('deadline_id', deadline.id)
    .eq('channel', channel)
    .eq('sent_status', 'pending')

  if (deleteError) {
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Reminder could not be saved')
  }

  const { data, error } = await supabaseAdmin
    .from('reminders')
    .upsert(reminderRows, {
      onConflict: 'deadline_id,offset_days,channel',
    })
    .select('id, deadline_id, reminder_time, offset_days, channel, sent_status, created_at')

  if (error) {
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Reminder could not be saved')
  }

  return sendSuccess(res, data || [], 'Reminder updated')
})

export { deadlineReminderRoutes }
export default router
