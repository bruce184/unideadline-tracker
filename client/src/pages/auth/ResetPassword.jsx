import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchUserData, updateUserPassword } from '../../services'
import {
  getPasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  validatePassword,
} from '../../utils/passwordValidation'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [token, setToken] = useState(null)
  const [verifying, setVerifying] = useState(true)
  const [tokenError, setTokenError] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const initSessionAndProfile = async () => {
      await Promise.resolve() // Defer to microtask to prevent synchronous setState lint error

      const hash = window.location.hash
      if (!hash) {
        setTokenError('Liên kết khôi phục mật khẩu không hợp lệ hoặc đã hết hạn.')
        setVerifying(false)
        return
      }

      const params = new URLSearchParams(hash.substring(1)) // Remove '#'
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const expiresIn = params.get('expires_in')
      const type = params.get('type')

      if (!accessToken || type !== 'recovery') {
        setTokenError('Liên kết khôi phục mật khẩu không hợp lệ hoặc đã hết hạn.')
        setVerifying(false)
        return
      }

      try {
        // Lấy thông tin user bằng access token mới trích xuất
        const userPayload = await fetchUserData(accessToken)
        
        // Tạo session đăng nhập tạm thời
        const session = {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: Math.floor(Date.now() / 1000) + Number(expiresIn || 3600),
          user: userPayload,
        }
        localStorage.setItem('unideadline.supabase.session', JSON.stringify(session))
        
        setToken(accessToken)
      } catch (err) {
        setTokenError(err.message || 'Không thể xác nhận thông tin khôi phục tài khoản.')
      } finally {
        setVerifying(false)
      }
    }

    initSessionAndProfile()
  }, [])

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
    setSuccess(false)

    // Xác thực độ mạnh mật khẩu
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setPasswordErrors(passwordValidation.errors)
      return
    }

    // Kiểm tra mật khẩu nhập lại
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không trùng khớp.')
      return
    }

    setLoading(true)

    try {
      // Gọi API cập nhật mật khẩu mới của Supabase
      await updateUserPassword(token, password)
      setSuccess(true)
      
      // Chuyển hướng về trang chủ sau 2.5 giây
      setTimeout(() => {
        navigate('/dashboard')
      }, 2500)
    } catch (err) {
      setError(err.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.')
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
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Đặt lại mật khẩu</h1>

        {verifying ? (
          <div className="mt-8 text-center text-slate-500">
            <p>Đang xác thực liên kết khôi phục...</p>
          </div>
        ) : tokenError ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              {tokenError}
            </div>
            <Link
              to="/forgot-password"
              className="block w-full text-center rounded-lg bg-[#5b45d8] py-2.5 text-sm font-semibold text-white hover:bg-[#4933c5]"
            >
              Yêu cầu liên kết mới
            </Link>
          </div>
        ) : success ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
              <p className="font-semibold">Đổi mật khẩu thành công!</p>
              <p className="mt-1 text-xs text-green-700">
                Mật khẩu của bạn đã được thay đổi. Hệ thống đang tự động chuyển hướng bạn tới trang cá nhân sau vài giây...
              </p>
            </div>
            <Link
              to="/dashboard"
              className="block w-full text-center rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
            >
              Truy cập Dashboard ngay
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                Mật khẩu mới
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) => handlePasswordChange(event.target.value)}
                className={`mt-1 w-full rounded-lg border bg-[#fbfaff] px-3 py-2.5 text-sm outline-none focus:ring-2 ${
                  isPasswordValid
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-100'
                    : password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-[#e5def8] focus:border-[#6b5bd6] focus:ring-[#eee8ff]'
                }`}
                placeholder="Nhập ít nhất 8 ký tự"
              />

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

            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
                Nhập lại mật khẩu mới
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2.5 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !confirmPassword}
              className="w-full rounded-lg bg-[#5b45d8] py-2.5 text-sm font-semibold text-white hover:bg-[#4933c5] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
