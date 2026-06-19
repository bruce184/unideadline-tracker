import { getSupabaseAdmin } from '../config/supabase.js'
import { sendError, sendSuccess } from '../utils/responses.js'

/**
 * Register
 * POST /api/v1/auth/register
 */
export async function register(req, res) {
  const supabaseAdmin = getSupabaseAdmin()
  const { email, password, display_name } = req.body

  // Validation
  if (!email || !password) {
    return sendError(
      res,
      400,
      'VALIDATION_ERROR',
      'Email and password are required'
    )
  }

  if (password.length < 6) {
    return sendError(
      res,
      400,
      'VALIDATION_ERROR',
      'Password must be at least 6 characters'
    )
  }

  // Check existing user
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingProfile) {
    return sendError(
      res,
      400,
      'EMAIL_EXISTS',
      'Email already exists'
    )
  }

  // Create user directly without sending verification email
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (error) {
    return sendError(
      res,
      400,
      'REGISTER_FAILED',
      error.message
    )
  }

  // Create profile
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: data.user.id,
      email,
      display_name: display_name?.trim() || null
    })

  if (profileError) {
    return sendError(
      res,
      400,
      'PROFILE_CREATE_FAILED',
      profileError.message
    )
  }

  return sendSuccess(
    res,
    {
      id: data.user.id,
      email: data.user.email,
      display_name
    },
    'Register successful'
  )
}

/**
 * Login
 * POST /api/v1/auth/login
 */
export async function login(req, res) {
  const supabaseAdmin = getSupabaseAdmin()
  const { email, password } = req.body

  if (!email || !password) {
    return sendError(
      res,
      400,
      'VALIDATION_ERROR',
      'Email and password are required'
    )
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return sendError(
      res,
      401,
      'LOGIN_FAILED',
      error.message
    )
  }

  return sendSuccess(
    res,
    {
      user: data.user,
      session: data.session
    },
    'Login successful'
  )
}

/**
 * Get current profile
 * GET /api/v1/me
 */
export async function getCurrentProfile(req, res) {
  const supabaseAdmin = getSupabaseAdmin()

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single()

  if (error) {
    return sendError(res, 404, 'PROFILE_NOT_FOUND', 'Profile not found')
  }

  return sendSuccess(res, data, 'Profile fetched')
}

/**
 * Update profile
 * PATCH /api/v1/me
 */
export async function updateProfile(req, res) {
  const supabaseAdmin = getSupabaseAdmin()
  const { display_name } = req.body

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ display_name: display_name?.trim() || null })
    .eq('id', req.user.id)
    .select()
    .single()

  if (error) {
    return sendError(res, 400, 'UPDATE_FAILED', error.message)
  }

  return sendSuccess(res, data, 'Profile updated')
}