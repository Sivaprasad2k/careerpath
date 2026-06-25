import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboardIcon, BriefcaseIcon, CalendarIcon, LogOutIcon, CompassIcon,
  SearchIcon, CheckSquareIcon, BarChart3Icon, FolderIcon,
  HistoryIcon, Menu, X
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import NotificationBell from '../../features/notifications/NotificationBell'

const NAV = [
  { to: '/dashboard',     icon: LayoutDashboardIcon, label: 'Pipeline' },
  { to: '/opportunities', icon: BriefcaseIcon,       label: 'Applications List' },
  { to: '/tasks',         icon: CheckSquareIcon,     label: 'Tasks & Prep' },
  { to: '/calendar',      icon: CalendarIcon,        label: 'Calendar & Reminders' },
  { to: '/analytics',     icon: BarChart3Icon,       label: 'Analytics' },
  { to: '/documents',     icon: FolderIcon,          label: 'Documents' },
  { to: '/timeline',      icon: HistoryIcon,         label: 'Timeline Journey' },
]

export default function AppShell() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-darkBg text-white overflow-hidden font-sans">
      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 flex flex-col bg-darkSecondary border-r border-darkBorder z-40 transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:z-20 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Rebrand */}
        <div className="px-6 py-5 border-b border-darkBorder flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-500/10">
              <CompassIcon size={18} className="text-white animate-spin-slow" />
            </div>
            <span className="text-lg font-black text-white tracking-tight">
              CareerPath
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-darkCard transition-colors"
            title="Close Menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all group ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 hover:bg-darkCard/60 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute inset-0 bg-brand-500/5 border-l-2 border-brand-500 rounded-xl"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon size={15} className={`relative z-10 ${isActive ? 'text-brand-500' : 'text-gray-400 group-hover:text-white transition-colors'}`} />
                  <span className="relative z-10 group-hover:translate-x-0.5 transition-transform duration-200">{label}</span>
                  {isActive && (
                    <span className="absolute right-3.5 w-1.5 h-1.5 rounded-full bg-brand-500 shadow-lg shadow-brand-500/40 relative z-10" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-darkBorder bg-darkSecondary/50">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl border border-transparent hover:border-darkBorder hover:bg-darkCard/50 transition-all duration-300">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-500 to-brand-700 flex items-center justify-center font-black text-white text-sm shadow-md shadow-brand-500/10 shrink-0">
              {user?.name?.slice(0, 2).toUpperCase() || 'CP'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-500 truncate font-semibold">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-darkCard transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOutIcon size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Area ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Header Bar */}
        <header className="h-16 bg-darkSecondary/80 backdrop-blur-md border-b border-darkBorder flex items-center justify-between px-4 md:px-8 relative z-20">
          <div className="flex items-center gap-3">
            {/* Hamburger button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-darkCard/50 transition-colors"
              title="Open Menu"
            >
              <Menu size={20} />
            </button>

            {/* Mock Search Bar */}
            <div className="relative w-40 sm:w-72 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-brand-500 transition-colors">
                <SearchIcon size={14} />
              </div>
              <input
                type="text"
                placeholder="Search applications..."
                className="w-full bg-darkBg/60 border border-darkBorder rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500/80 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* In-app Notification Bell */}
            <NotificationBell />
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-darkBg">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

