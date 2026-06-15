import { supabase } from '../config/supabase.js'
import { sendError } from '../utils/responses.js'

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(
      res,
      401,
      'UNAUTHORIZED',
      'Missing or invalid authorization token'
    )
  }

  const token = authHeader.replace('Bearer ', '').trim()

  if (!token) {
    return sendError(
      res,
      401,
      'UNAUTHORIZED',
      'Missing or invalid authorization token'
    )
  }

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data?.user) {
    return sendError(
      res,
      401,
      'UNAUTHORIZED',
      'Missing or invalid authorization token'
    )
  }

  req.user = data.user

  return next()
}