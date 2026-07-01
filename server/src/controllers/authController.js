import { sendError, sendSuccess } from '../utils/responses.js'
import { findProfileById } from '../models/profileModel.js'

/**
 * Get current profile
 * GET /api/v1/me
 */
export async function getCurrentProfile(req, res) {
  const { data, error } = await findProfileById(req.user.id)

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
