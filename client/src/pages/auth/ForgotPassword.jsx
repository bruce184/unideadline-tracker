import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendResetPasswordEmail } from '../../services'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      await sendResetPasswordEmail(email)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Gửi yêu cầu đặt lại mật khẩu thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f5ff] px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-[#e9e2fb] bg-white p-6 shadow-[0_24px_80px_rgba(91,69,170,0.10)] sm:p-8">
        <p className="text-sm font-semibold text-[#6b5bd6]">UniDeadline Tracker</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Quên mật khẩu</h1>
        <p className="mt-2 text-sm text-slate-500">
          Nhập địa chỉ email của bạn, chúng tôi sẽ gửi liên kết khôi phục mật khẩu.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
              <p className="font-semibold">Đã gửi email khôi phục!</p>
              <p className="mt-1 text-xs text-green-700">
                Hãy kiểm tra hộp thư đến của email <span className="font-medium">{email}</span> để hoàn thành việc đặt lại mật khẩu.
              </p>
            </div>
            <Link
              to="/login"
              className="block w-full text-center rounded-lg bg-[#5b45d8] py-2.5 text-sm font-semibold text-white hover:bg-[#4933c5]"
            >
              Quay lại Đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                Địa chỉ Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2.5 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
                placeholder="student@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full rounded-lg bg-[#5b45d8] py-2.5 text-sm font-semibold text-white hover:bg-[#4933c5] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}
            </button>
          </form>
        )}

        {!success && (
          <p className="mt-6 text-center text-sm text-slate-500">
            Nhớ ra mật khẩu?{' '}
            <Link to="/login" className="font-semibold text-[#5140b6] hover:underline">
              Đăng nhập
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
