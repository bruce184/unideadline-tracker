import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { validatePassword, getPasswordStrength, getPasswordStrengthColor, getPasswordStrengthLabel } from '../../utils/passwordValidation'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = (value) => {
    setPassword(value)
    if (value) {
      const validation = validatePassword(value)
      setPasswordErrors(validation.errors)
    } else {
      setPasswordErrors([])
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    // Validate password before submit
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setPasswordErrors(passwordValidation.errors)
      return
    }

    setLoading(true)

    try {
      await register(email, password, displayName)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = getPasswordStrength(password)
  const passwordStrengthColor = getPasswordStrengthColor(passwordStrength)
  const passwordStrengthLabel = getPasswordStrengthLabel(passwordStrength)
  const isPasswordValid = passwordErrors.length === 0 && password.length > 0

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f5ff] px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-[#e9e2fb] bg-white p-6 shadow-[0_24px_80px_rgba(91,69,170,0.10)] sm:p-8">
        <p className="text-sm font-semibold text-[#6b5bd6]">UniDeadline Tracker</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Đăng ký</h1>

        {error && (
          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="displayName">
              Họ và tên
            </label>
            <input
              id="displayName"
              type="text"
              required
              maxLength={120}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
              placeholder="Ví dụ: Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
              placeholder="student@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="password">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => handlePasswordChange(event.target.value)}
              className={`mt-1 w-full rounded-lg border bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:ring-2 ${
                isPasswordValid
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-100'
                  : password
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                    : 'border-[#e5def8] focus:border-[#6b5bd6] focus:ring-[#eee8ff]'
              }`}
              placeholder="Ít nhất 8 ký tự, 1 chữ hoa, 1 chữ số"
            />

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-1 flex-1 rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all ${passwordStrengthColor}`}
                      style={{
                        width:
                          passwordStrength === 'weak'
                            ? '33%'
                            : passwordStrength === 'fair'
                              ? '66%'
                              : '100%',
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-500">{passwordStrengthLabel}</span>
                </div>

                {/* Password Errors */}
                {passwordErrors.length > 0 && (
                  <ul className="space-y-1">
                    {passwordErrors.map((err, idx) => (
                      <li key={idx} className="text-xs text-red-600">
                        • {err}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid || !email || !displayName}
            className="w-full rounded-lg bg-[#5b45d8] py-2.5 text-sm font-semibold text-white hover:bg-[#4933c5] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-[#5140b6] hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
