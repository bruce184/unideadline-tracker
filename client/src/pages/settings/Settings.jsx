import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { useAuth } from '../../hooks/useAuth'

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
      await logout()
      navigate('/login')
    }
  }

  return (
    <Layout>
      <header className="mb-6 flex w-full items-center justify-between rounded-2xl border border-[#e9e2fb] bg-white px-4 py-3 shadow-[0_14px_40px_rgba(91,69,170,0.03)]">
        <h2 className="text-xl font-bold text-slate-900">Cài đặt tài khoản</h2>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 pb-10">
        <section className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-outline-variant/30 bg-[#f0ecf6]">
            <span className="material-symbols-outlined text-[48px] text-[#3b309e]">account_circle</span>
          </div>

          <div className="flex-1 space-y-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-slate-900">{user?.display_name || 'Chưa có tên'}</h3>
            <p className="text-sm font-medium text-slate-500">{user?.email || 'Chưa có email'}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
            <span className="material-symbols-outlined text-[18px] text-[#3b309e]">hub</span>
            Tích hợp dữ liệu
          </h3>

          <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[32px] text-red-500">mail</span>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Gmail</h4>
                <p className="text-[10px] text-slate-400">Kết nối và nhập deadline từ email</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/integrations')}
              className="rounded-lg bg-[#3b309e] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#2e2482]"
            >
              Quản lý tích hợp
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-red-100 bg-red-50/50 p-6">
          <h3 className="flex items-center gap-2 border-b border-red-100 pb-3 text-sm font-bold text-red-800">
            <span className="material-symbols-outlined text-[18px] font-bold text-red-800">logout</span>
            Phiên đăng nhập
          </h3>

          <div className="flex flex-col items-start justify-between gap-4 pt-4 sm:flex-row sm:items-center">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Đăng xuất khỏi hệ thống</h4>
              <p className="mt-0.5 text-[10px] leading-normal text-slate-500">
                Thoát tài khoản khỏi phiên làm việc hiện tại trên thiết bị này.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex shrink-0 items-center gap-1 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-red-700"
            >
              <span className="material-symbols-outlined text-[14px]">logout</span>
              Thoát tài khoản
            </button>
          </div>
        </section>
      </div>
    </Layout>
  )
}
