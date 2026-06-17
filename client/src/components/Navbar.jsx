import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/courses', label: 'Mon hoc' },
  { to: '/deadlines', label: 'Deadline' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="border-b border-slate-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/dashboard" className="text-lg font-bold text-blue-600">
          UniDeadline
        </Link>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (
                `rounded-lg px-3 py-1.5 text-sm ${
                  isActive
                    ? 'bg-blue-50 font-semibold text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                }`
              )}
            >
              {item.label}
            </NavLink>
          ))}
          <span className="max-w-[180px] truncate text-sm text-slate-400">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
          >
            Dang xuat
          </button>
        </div>
      </div>
    </nav>
  )
}
