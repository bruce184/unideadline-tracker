import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { to: '/dashboard', label: 'Tổng quan', tone: 'bg-[#5b45d8]' },
  { to: '/courses', label: 'Môn học', tone: 'bg-teal-500' },
  { to: '/deadlines', label: 'Deadline', tone: 'bg-amber-500' },
  { to: '/ai-suggestions', label: 'Gợi ý AI', tone: 'bg-fuchsia-500' },
  { to: '/risk-analysis', label: 'Phân tích rủi ro', tone: 'bg-rose-500' },
]

function NavItem({ item, compact = false }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) => (
        `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
          isActive
            ? 'bg-[#eee8ff] font-semibold text-[#5140b6] shadow-sm'
            : 'text-slate-500 hover:bg-white hover:text-[#5140b6] hover:shadow-sm'
        } ${compact ? 'justify-center' : ''}`
      )}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white shadow-sm">
        <span className={`block h-3.5 w-3.5 rounded ${item.tone}`} />
      </span>
      {!compact && <span>{item.label}</span>}
    </NavLink>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#e9e2fb] bg-white/95 px-4 py-5 shadow-[8px_0_30px_rgba(91,69,170,0.05)] backdrop-blur lg:block">
        <div className="flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#5b45d8] text-sm font-bold text-white shadow-[0_12px_24px_rgba(91,69,216,0.28)]">
            UD
          </div>
          <div>
            <p className="text-sm font-bold text-[#4d3fc0]">UniDeadline</p>
            <p className="text-xs text-slate-400">Tracker</p>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-2xl border border-[#eee8ff] bg-[#fbfaff] p-3">
          <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Tài khoản</p>
          <p className="truncate text-xs font-semibold text-slate-700">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 w-full rounded-lg bg-[#5b45d8] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4933c5]"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-[#e9e2fb] bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#5b45d8] text-xs font-bold text-white">
              UD
            </div>
            <span className="font-bold text-[#4d3fc0]">UniDeadline</span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-[#f0ebff] px-3 py-2 text-xs font-semibold text-[#5140b6]"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <nav className="fixed bottom-3 left-3 right-3 z-30 grid grid-cols-5 gap-2 rounded-2xl border border-[#e9e2fb] bg-white/95 p-2 shadow-[0_18px_40px_rgba(91,69,170,0.16)] backdrop-blur lg:hidden">
        {navItems.map((item) => (
          <NavItem key={item.to} item={item} compact />
        ))}
      </nav>
    </>
  )
}
