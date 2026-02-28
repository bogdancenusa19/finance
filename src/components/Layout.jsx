import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  LayoutDashboard, ArrowLeftRight, Upload,
  PiggyBank, LogOut, Menu, X, TrendingUp
} from 'lucide-react'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Tranzacții' },
  { to: '/budget', icon: PiggyBank, label: 'Buget' },
  { to: '/import', icon: Upload, label: 'Import BT' },
]

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <TrendingUp size={22} color="var(--accent)" />
          <span className="sidebar-title">FinTrack</span>
          <button className="close-btn" onClick={() => setOpen(false)}><X size={18} /></button>
        </div>
        <nav className="sidebar-nav">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to} end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(true)}><Menu size={20} /></button>
          <span className="topbar-title">Finance Tracker</span>
        </header>
        <main className="main-content">{children}</main>
      </div>

      {open && <div className="overlay" onClick={() => setOpen(false)} />}
    </div>
  )
}
