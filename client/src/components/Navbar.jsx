import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { to: '/dashboard', label: 'Tổng quan', icon: 'dashboard' },
  { to: '/deadlines', label: 'Lịch deadline', icon: 'calendar_month' },
  { to: '/tasks', label: 'Nhiệm vụ', icon: 'assignment' },
  { to: '/courses', label: 'Môn học', icon: 'menu_book' },
  { to: '/ai-suggestions', label: 'Gợi ý AI', icon: 'smart_toy' },
  { to: '/risk-analysis', label: 'Phân tích rủi ro', icon: 'analytics' },
]

export default function Navbar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
      await logout()
      navigate('/login')
    }
  }

  return (
    <>
      {/* Desktop Sidebar Shell */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#e9e2fb] bg-white lg:flex flex-col h-screen bg-surface">
        {/* Brand Branding Header */}
        <div className="p-6">
          <h1 className="text-xl font-extrabold text-[#3b309e] tracking-tight">UniDeadline</h1>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-semibold opacity-70">Tracker</p>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (
                `flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#f0ecf6] text-[#3b309e] font-bold border border-[#3b309e]/15'
                    : 'text-[#474553] hover:bg-[#f0ecf6]/40 hover:text-[#3b309e]'
                }`
              )}
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined text-[20px] shrink-0"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span className="font-body-md text-body-md">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer Operations */}
        <div className="p-4 border-t border-[#e9e2fb] space-y-2">
          {/* Tích hợp Link Button */}
          <NavLink
            to="/integrations"
            className={({ isActive }) => (
              `w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl transition-all font-semibold text-xs cursor-pointer shadow-xs ${
                isActive
                  ? 'bg-[#3b309e] text-white'
                  : 'bg-[#3b309e] text-white hover:bg-[#312888]'
              }`
            )}
          >
            <span className="material-symbols-outlined text-[18px]">sync</span>
            Tích hợp
          </NavLink>

          {/* Cài đặt Link */}
          <NavLink
            to="/settings"
            className={({ isActive }) => (
              `flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-[#f0ecf6] text-[#3b309e] font-bold border border-[#3b309e]/15'
                  : 'text-[#474553] hover:bg-[#f0ecf6]/40 hover:text-[#3b309e]'
              }`
            )}
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined text-[20px] shrink-0"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  settings
                </span>
                <span className="font-body-md text-body-md">Cài đặt</span>
              </>
            )}
          </NavLink>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-20 border-b border-[#e9e2fb] bg-white/90 px-4 py-3 backdrop-blur lg:hidden flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#3b309e] text-xs font-extrabold text-white">
            UD
          </div>
          <span className="font-extrabold text-sm text-[#3b309e]">UniDeadline</span>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-50 border border-red-200 text-red-600 px-3 py-1.5 text-xs font-bold"
        >
          Đăng xuất
        </button>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-1.5 bg-white border-t border-[#e9e2fb] lg:hidden shadow-lg">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (
              `flex flex-col items-center justify-center p-1 rounded-xl transition ${
                isActive ? 'text-[#3b309e] font-bold' : 'text-slate-400'
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
                <span className="text-[9px] mt-0.5">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
