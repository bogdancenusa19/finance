import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Settings, Menu, X, TrendingUp, LogOut } from 'lucide-react'

const nav = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Tranzactii' },
  { to: '/budget',       icon: PiggyBank,       label: 'Buget' },
  { to: '/admin',        icon: Settings,        label: 'Setari' },
]

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark"><TrendingUp size={16} /></div>
          <span className="logo-text">FinTrack</span>
          <button className="sidebar-close" onClick={() => setOpen(false)}><X size={16} /></button>
        </div>
        <nav className="sidebar-nav">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to} end={to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <button className="hamburger" onClick={() => setOpen(true)}><Menu size={20} /></button>
          <div className="topbar-brand">
            <div className="logo-mark small"><TrendingUp size={14} /></div>
            <span>FinTrack</span>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>

      {open && <div className="overlay" onClick={() => setOpen(false)} />}
    </div>
  )
}
