import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Login() {
  const { login } = useAuth()
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
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-[#f8f5ff] px-4 py-8 lg:grid-cols-[1fr_480px]">
      <section className="hidden rounded-3xl border border-[#e9e2fb] bg-white p-8 shadow-[0_24px_80px_rgba(91,69,170,0.10)] lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#5b45d8] text-sm font-bold text-white">
            UD
          </div>
          <h1 className="mt-8 max-w-xl text-4xl font-bold tracking-tight text-slate-950">
            UniDeadline Tracker
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-500">
            Theo dõi môn học, deadline và workload hằng tuần trong một workspace gọn gàng.
          </p>
        </div>
        <div className="grid gap-3">
          <div className="rounded-2xl bg-[#f1edff] p-4">
            <p className="text-sm font-semibold text-[#5140b6]">Tổng quan</p>
            <div className="mt-4 h-2 rounded-full bg-white">
              <div className="h-full w-2/3 rounded-full bg-[#5b45d8]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-2xl font-bold text-slate-950">08</p>
              <p className="text-xs text-slate-400">Việc cần làm</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-4">
              <p className="text-2xl font-bold text-red-700">Cao</p>
              <p className="text-xs text-red-400">Rủi ro</p>
            </div>
            <div className="rounded-2xl bg-teal-50 p-4">
              <p className="text-2xl font-bold text-teal-700">65%</p>
              <p className="text-xs text-teal-500">Hoàn thành</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-[#e9e2fb] bg-white p-6 shadow-[0_24px_80px_rgba(91,69,170,0.10)] sm:p-8">
          <p className="text-sm font-semibold text-[#6b5bd6]">UniDeadline Tracker</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Đăng nhập</h1>

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
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-[#5140b6] hover:underline">
              Đăng ký
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
