import { getSupabaseAdmin } from '../config/supabase.js'

export function findProfileByEmail(email) {
  return getSupabaseAdmin()
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()
}

export function createConfirmedUser({ email, password }) {
  return getSupabaseAdmin().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
}

export function signInWithPassword({ email, password }) {
  return getSupabaseAdmin().auth.signInWithPassword({ email, password })
}

export function createProfile(profile) {
  return getSupabaseAdmin()
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
}

export function findProfileById(userId) {
  return getSupabaseAdmin()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
}

export function updateProfileById(userId, updates) {
  return getSupabaseAdmin()
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
}
