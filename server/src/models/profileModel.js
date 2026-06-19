import { getSupabaseAdmin } from '../config/supabase.js'

export function findProfileById(userId) {
  return getSupabaseAdmin()
    .from('profiles')
    .select('id, email, display_name, created_at, updated_at')
    .eq('id', userId)
    .single()
}
