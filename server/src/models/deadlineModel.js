import { getSupabaseAdmin } from '../config/supabase.js'

const DEADLINE_FIELDS = `
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
`

const DEADLINE_WITH_COURSE_FIELDS = `
  ${DEADLINE_FIELDS},
  course:courses (
    id,
    course_name,
    course_code
  )
`

export function findOwnedDeadlines({ userId, filters, sortBy, sortOrder, from, to, now }) {
  let query = getSupabaseAdmin()
    .from('deadlines')
    .select(DEADLINE_WITH_COURSE_FIELDS, { count: 'exact' })
    .eq('user_id', userId)

  if (filters.course_id) {
    query = query.eq('course_id', filters.course_id)
  }

  if (filters.status === 'Overdue') {
    query = query
      .lt('due_date', now)
      .neq('status', 'Submitted')
  } else if (filters.status) {
    query = query.eq('status', filters.status)

    if (filters.status !== 'Submitted') {
      query = query.gte('due_date', now)
    }
  }

  if (filters.priority) {
    query = query.eq('priority', filters.priority)
  }

  if (filters.from) {
    query = query.gte('due_date', filters.from)
  }

  if (filters.to) {
    query = query.lte('due_date', filters.to)
  }

  if (filters.q) {
    query = query.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`)
  }

  return query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(from, to)
}

export function createDeadlineRecord(payload) {
  return getSupabaseAdmin()
    .from('deadlines')
    .insert(payload)
    .select(DEADLINE_FIELDS)
    .single()
}

export function findOwnedDeadlineDetails(deadlineId, userId) {
  return getSupabaseAdmin()
    .from('deadlines')
    .select(`
      ${DEADLINE_WITH_COURSE_FIELDS},
      reminders (
        id,
        reminder_time,
        offset_days,
        channel,
        sent_status,
        created_at
      )
    `)
    .eq('id', deadlineId)
    .eq('user_id', userId)
    .single()
}

export function findOwnedDeadlineById(deadlineId, userId, fields = 'id, user_id, course_id') {
  return getSupabaseAdmin()
    .from('deadlines')
    .select(fields)
    .eq('id', deadlineId)
    .eq('user_id', userId)
    .single()
}

export function updateOwnedDeadline(deadlineId, userId, updates) {
  return getSupabaseAdmin()
    .from('deadlines')
    .update(updates)
    .eq('id', deadlineId)
    .eq('user_id', userId)
    .select(DEADLINE_FIELDS)
    .single()
}

export function deleteOwnedDeadline(deadlineId, userId) {
  return getSupabaseAdmin()
    .from('deadlines')
    .delete()
    .eq('id', deadlineId)
    .eq('user_id', userId)
    .select('id')
    .single()
}

export function countOwnedDeadlinesForCourse(courseId, userId) {
  return getSupabaseAdmin()
    .from('deadlines')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', courseId)
    .eq('user_id', userId)
}

export function findWeeklyOwnedDeadlines(userId, weekStart, weekEnd) {
  return getSupabaseAdmin()
    .from('deadlines')
    .select(DEADLINE_WITH_COURSE_FIELDS)
    .eq('user_id', userId)
    .gte('due_date', weekStart)
    .lte('due_date', weekEnd)
    .order('due_date', { ascending: true })
}
