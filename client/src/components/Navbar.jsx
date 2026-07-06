import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { to: '/dashboard', label: 'Tong quan', icon: 'dashboard' },
  { to: '/deadlines', label: 'Lich deadline', icon: 'calendar_month' },
  { to: '/tasks', label: 'Nhiem vu', icon: 'assignment' },
  { to: '/courses', label: 'Mon hoc', icon: 'menu_book' },
  { to: '/friends-groups', label: 'Nhom ban', icon: 'groups' },
  { to: '/ai-suggestions', label: 'Goi y AI', icon: 'smart_toy' },
  { to: '/risk-analysis', label: 'Phan tich rui ro', icon: 'analytics' },
]

export default function Navbar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (window.confirm('Ban co chac chan muon dang xuat khong?')) {
      await logout()
      navigate('/login')
    }
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden h-screen w-64 flex-col border-r border-[#e9e2fb] bg-white lg:flex">
        <div className="p-6">
          <h1 className="text-xl font-extrabold tracking-tight text-[#3b309e]">UniDeadline</h1>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 opacity-70">Tracker</p>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (
                `flex items-center gap-3 rounded-xl p-2.5 transition-all ${
                  isActive
                    ? 'border border-[#3b309e]/15 bg-[#f0ecf6] font-bold text-[#3b309e]'
                    : 'text-[#474553] hover:bg-[#f0ecf6]/40 hover:text-[#3b309e]'
                }`
              )}
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined shrink-0 text-[20px]"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 border-t border-[#e9e2fb] p-4">
          <NavLink
            to="/integrations"
            className={({ isActive }) => (
              `flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all ${
                isActive ? 'bg-[#3b309e]' : 'bg-[#3b309e] hover:bg-[#312888]'
              }`
            )}
          >
            <span className="material-symbols-outlined text-[18px]">sync</span>
            Tich hop
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) => (
              `flex items-center gap-3 rounded-xl p-2.5 transition-all ${
                isActive
                  ? 'border border-[#3b309e]/15 bg-[#f0ecf6] font-bold text-[#3b309e]'
                  : 'text-[#474553] hover:bg-[#f0ecf6]/40 hover:text-[#3b309e]'
              }`
            )}
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined shrink-0 text-[20px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  settings
                </span>
                <span className="text-sm font-medium">Cai dat</span>
              </>
            )}
          </NavLink>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e9e2fb] bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#3b309e] text-xs font-extrabold text-white">
            UD
          </div>
          <span className="text-sm font-extrabold text-[#3b309e]">UniDeadline</span>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600"
        >
          Dang xuat
        </button>
      </header>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-[#e9e2fb] bg-white px-2 py-1.5 shadow-lg lg:hidden">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (
              `flex flex-col items-center justify-center rounded-xl p-1 transition ${
                isActive ? 'font-bold text-[#3b309e]' : 'text-slate-400'
              }`
            )}
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className="mt-0.5 text-[9px]">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
