import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

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
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#5b45d8] py-2.5 text-sm font-semibold text-white hover:bg-[#4933c5] disabled:opacity-50"
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
