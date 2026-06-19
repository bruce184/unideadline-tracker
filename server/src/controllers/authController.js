import { getSupabaseAdmin } from '../config/supabase.js'
import { sendError, sendSuccess } from '../utils/responses.js'

/**
 * Get current user profile
 * GET /api/v1/me
 */
export async function getCurrentUser(req, res) {
  const supabaseAdmin = getSupabaseAdmin()

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, display_name, created_at, updated_at')
    .eq('id', req.user.id)
    .single()

  if (error) {
    return sendError(
      res,
      404,
      'NOT_FOUND',
      'Current user profile was not found'
    )
  }

  return sendSuccess(res, data, 'Current user loaded')
}
