import { getSupabaseAdmin } from '../config/supabase.js'

const COURSE_FIELDS = 'id, user_id, course_name, course_code, semester, created_at, updated_at'

export function findOwnedCourses({
  userId,
  semester,
  searchFilter,
  sortOrder,
  from,
  to,
}) {
  let query = getSupabaseAdmin()
    .from('courses')
    .select(COURSE_FIELDS, { count: 'exact' })
    .eq('user_id', userId)

  if (semester) {
    query = query.eq('semester', semester)
  }

  if (searchFilter) {
    query = query.or(searchFilter)
  }

  return query
    .order('course_name', { ascending: sortOrder === 'asc' })
    .range(from, to)
}

export function createCourseRecord(payload) {
  return getSupabaseAdmin()
    .from('courses')
    .insert(payload)
    .select(COURSE_FIELDS)
    .single()
}

export function updateOwnedCourse(courseId, userId, updates) {
  return getSupabaseAdmin()
    .from('courses')
    .update(updates)
    .eq('id', courseId)
    .eq('user_id', userId)
    .select(COURSE_FIELDS)
    .single()
}

export function deleteOwnedCourse(courseId, userId) {
  return getSupabaseAdmin()
    .from('courses')
    .delete()
    .eq('id', courseId)
    .eq('user_id', userId)
    .select('id')
    .single()
}

export function findOwnedCourseById(courseId, userId) {
  return getSupabaseAdmin()
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('user_id', userId)
    .single()
}
