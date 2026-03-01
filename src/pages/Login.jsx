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
    if (error) setError('Email sau parola incorecta.')
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-mark large"><TrendingUp size={20} /></div>
          <h1>FinTrack</h1>
          <p>Gestioneaza-ti finantele personal</p>
        </div>
        <form onSubmit={handleLogin} className="login-form">
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Parola</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn-primary full" disabled={loading}>
            {loading ? 'Se conecteaza...' : 'Intra in cont'}
          </button>
        </form>
      </div>
    </div>
  )
}
