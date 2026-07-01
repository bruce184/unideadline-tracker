import { sendError, sendSuccess } from '../utils/responses.js'
import { findWeeklyOwnedDeadlines } from '../models/deadlineModel.js'

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DISPLAY_TIMEZONE_OFFSET_MS = 7 * 60 * 60 * 1000

/**
 * Get weekly dashboard data
 * GET /api/v1/dashboard/weekly
 */
export async function getWeeklyDashboard(req, res) {
  let weekStart = parseWeekStart(req.query.week_start)

  if (!weekStart) {
    return sendError(res, 400, 'INVALID_QUERY', 'week_start must use YYYY-MM-DD format')
  }

  weekStart = startOfWeek(weekStart)
  const weekEnd = endOfWeek(weekStart)
  const nextWeekStart = addDays(weekStart, 7)
  const { data, error } = await findWeeklyOwnedDeadlines(
    req.user.id,
    toUtcInstant(weekStart),
    toUtcInstant(nextWeekStart)
  )

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
}

/**
 * Helper: Calculate beginning of week (Monday 00:00)
 */
function startOfWeek(date) {
  const result = new Date(date)
  const day = result.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day

  result.setUTCDate(result.getUTCDate() + diff)

  return result
}

/**
 * Helper: Calculate the Sunday calendar date for the response.
 */
function endOfWeek(date) {
  return addDays(date, 6)
}

/**
 * Helper: Format date as YYYY-MM-DD
 */
function formatDateOnly(date) {
  return date.toISOString().slice(0, 10)
}

/**
 * Helper: Parse and validate week_start query parameter
 */
function parseWeekStart(value) {
  if (value === undefined) {
    return getDisplayDate(new Date())
  }

  if (!DATE_ONLY_PATTERN.test(String(value))) {
    return null
  }

  const date = new Date(`${value}T00:00:00.000Z`)

  if (Number.isNaN(date.getTime()) || formatDateOnly(date) !== value) {
    return null
  }

  return date
}

/**
 * Convert an instant to its calendar date in Asia/Ho_Chi_Minh.
 */
function getDisplayDate(date) {
  const shiftedDate = new Date(date.getTime() + DISPLAY_TIMEZONE_OFFSET_MS)

  return new Date(Date.UTC(
    shiftedDate.getUTCFullYear(),
    shiftedDate.getUTCMonth(),
    shiftedDate.getUTCDate()
  ))
}

/**
 * Convert an Asia/Ho_Chi_Minh calendar midnight to a UTC instant.
 */
function toUtcInstant(date) {
  return new Date(date.getTime() - DISPLAY_TIMEZONE_OFFSET_MS).toISOString()
}

function addDays(date, days) {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + days)
  return result
}

/**
 * Helper: Calculate summary statistics from deadlines
 */
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
