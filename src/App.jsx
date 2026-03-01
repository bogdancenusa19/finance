import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { AppProvider } from './contexts/AppContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budget from './pages/Budget'
import Admin from './pages/Admin'
import Login from './pages/Login'

function Protected({ session, children }) {
  if (!session) return <Navigate to="/login" replace />
  return (
    <AppProvider session={session}>
      <Layout>{children}</Layout>
    </AppProvider>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return (
    <div className="splash">
      <div className="spinner" />
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/" /> : <Login />} />
        <Route path="/"             element={<Protected session={session}><Dashboard /></Protected>} />
        <Route path="/transactions" element={<Protected session={session}><Transactions /></Protected>} />
        <Route path="/budget"       element={<Protected session={session}><Budget /></Protected>} />
        <Route path="/admin"        element={<Protected session={session}><Admin /></Protected>} />
      </Routes>
    </BrowserRouter>
  )
}
