import { getSupabaseAdmin } from '../config/supabase.js'

export function findProfileById(userId) {
  return getSupabaseAdmin()
    .from('profiles')
    .select('id, email, display_name, created_at, updated_at')
    .eq('id', userId)
    .single()
}

/**
 * Lấy nhiều profile cùng lúc theo danh sách user_id (dùng cho job gửi reminder)
 */
export function findProfilesByIds(userIds) {
  return getSupabaseAdmin()
    .from('profiles')
    .select('id, email, display_name')
    .in('id', userIds)
}