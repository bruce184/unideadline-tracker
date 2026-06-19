/**
 * Password validation rules
 */

const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireNumber: true,
  requireSpecialChar: false, // Optional for MVP
}

/**
 * Validate password strength
 * Returns { isValid: boolean, errors: string[] }
 */
export function validatePassword(password) {
  const errors = []

  if (!password) {
    errors.push('Mật khẩu không được để trống')
    return { isValid: false, errors }
  }

  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`Mật khẩu phải có ít nhất ${PASSWORD_RULES.minLength} ký tự`)
  }

  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa (A-Z)')
  }

  if (PASSWORD_RULES.requireNumber && !/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 chữ số (0-9)')
  }

  if (PASSWORD_RULES.requireSpecialChar && !/[!@#$%^&*]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*)')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Get password strength level (weak, fair, strong)
 */
export function getPasswordStrength(password) {
  if (!password) return 'none'

  let score = 0

  if (password.length >= PASSWORD_RULES.minLength) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[!@#$%^&*]/.test(password)) score++

  if (score <= 1) return 'weak'
  if (score <= 3) return 'fair'
  return 'strong'
}

/**
 * Get password strength color for UI
 */
export function getPasswordStrengthColor(strength) {
  switch (strength) {
    case 'weak':
      return 'bg-red-500'
    case 'fair':
      return 'bg-yellow-500'
    case 'strong':
      return 'bg-green-500'
    default:
      return 'bg-gray-300'
  }
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(strength) {
  switch (strength) {
    case 'weak':
      return 'Yếu'
    case 'fair':
      return 'Trung bình'
    case 'strong':
      return 'Mạnh'
    default:
      return ''
  }
}
