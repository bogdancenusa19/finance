import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { TrendingUp } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <TrendingUp size={28} color="#6366f1" />
          <h1>FinTrack</h1>
        </div>
        <p className="login-sub">Finance Tracker personal</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input className="form-input" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="email@example.com" required />
          </div>
          <div className="form-group">
            <label>Parolă</label>
            <input className="form-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button className="btn-primary full-width" type="submit" disabled={loading}>
            {loading ? 'Se autentifică...' : 'Intră în cont'}
          </button>
        </form>
      </div>
    </div>
  )
}
