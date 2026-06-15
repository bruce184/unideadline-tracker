import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { sendError, sendSuccess } from '../utils/responses.js'

const router = express.Router()

function startOfWeek(date) {
  const result = new Date(date)
  const day = result.getDay()
  const diff = day === 0 ? -6 : 1 - day

  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)

  return result
}

function endOfWeek(date) {
  const result = new Date(date)
  result.setDate(result.getDate() + 6)
  result.setHours(23, 59, 59, 999)

  return result
}

function formatDateOnly(date) {
  return date.toISOString().slice(0, 10)
}

function calculateSummary(deadlines, now) {
  const summary = {
    total: deadlines.length,
    not_started: 0,
    in_progress: 0,
    submitted: 0,
    overdue: 0,
    high_priority: 0,
  }

  for (const deadline of deadlines) {
    if (deadline.status === 'Not Started') {
      summary.not_started += 1
    }

    if (deadline.status === 'In Progress') {
      summary.in_progress += 1
    }

    if (deadline.status === 'Submitted') {
      summary.submitted += 1
    }

    if (deadline.priority === 'High') {
      summary.high_priority += 1
    }

    if (new Date(deadline.due_date) < now && deadline.status !== 'Submitted') {
      summary.overdue += 1
    }
  }

  return summary
}

router.get('/weekly', requireAuth, async (req, res) => {
  let weekStart = req.query.week_start
    ? new Date(req.query.week_start)
    : startOfWeek(new Date())

  if (Number.isNaN(weekStart.getTime())) {
    return sendError(res, 400, 'INVALID_QUERY', 'Invalid week_start')
  }

  weekStart = startOfWeek(weekStart)
  const weekEnd = endOfWeek(weekStart)

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
      )
    `)
    .eq('user_id', req.user.id)
    .gte('due_date', weekStart.toISOString())
    .lte('due_date', weekEnd.toISOString())
    .order('due_date', { ascending: true })

  if (error) {
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not load weekly dashboard')
  }

  const now = new Date()
  const summary = calculateSummary(data, now)

  return sendSuccess(
    res,
    {
      week_start: formatDateOnly(weekStart),
      week_end: formatDateOnly(weekEnd),
      summary,
      deadlines: data,
    },
    'Weekly dashboard loaded'
  )
})

export default router