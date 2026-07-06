import { getSupabaseAdmin } from '../config/supabase.js'

const FIELDS = `user_id, email, access_token, refresh_token, token_expires_at, connected_at, updated_at`

export function findGmailConnection(userId) {
  return getSupabaseAdmin()
    .from('gmail_connections')
    .select(FIELDS)
    .eq('user_id', userId)
    .maybeSingle()
}

/**
 * Lấy nhiều connection cùng lúc theo danh sách user_id (dùng cho job gửi reminder)
 */
export function findGmailConnectionsByUserIds(userIds) {
  return getSupabaseAdmin()
    .from('gmail_connections')
    .select('user_id, email')
    .in('user_id', userIds)
}

export function upsertGmailConnection(userId, payload) {
  return getSupabaseAdmin()
    .from('gmail_connections')
    .upsert({ user_id: userId, ...payload, updated_at: new Date().toISOString() })
    .select(FIELDS)
    .single()
}

export function deleteGmailConnection(userId) {
  return getSupabaseAdmin()
    .from('gmail_connections')
    .delete()
    .eq('user_id', userId)
}

export function findDeadlineByGmailMessageId(userId, gmailMessageId) {
  return getSupabaseAdmin()
    .from('deadlines')
    .select('id, gmail_message_id')
    .eq('user_id', userId)
    .eq('gmail_message_id', gmailMessageId)
    .maybeSingle()
}

export function insertDeadlineFromGmail(payload) {
  return getSupabaseAdmin()
    .from('deadlines')
    .insert(payload)
    .select('id')
    .single()
}