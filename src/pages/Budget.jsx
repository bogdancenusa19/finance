import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useBudget, useMonthlySummary } from '../hooks/useData'
import { CATEGORIES, MONTHS } from '../lib/constants'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import { Save } from 'lucide-react'

const YEAR = new Date().getFullYear()
const fmt = (n) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(n || 0)

export default function Budget() {
  const [year, setYear] = useState(YEAR)
  const { data: budgetData, loading } = useBudget(year)
  const { data: summary } = useMonthlySummary(year)
  const [budgets, setBudgets] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const map = {}
    budgetData.forEach(b => {
      if (!map[b.category]) map[b.category] = {}
      map[b.category][b.month] = b.amount
    })
    setBudgets(map)
  }, [budgetData])

  function setVal(cat, month, val) {
    setBudgets(prev => ({
      ...prev,
      [cat]: { ...(prev[cat] || {}), [month]: val }
    }))
  }

  async function handleSave() {
    setSaving(true)
    const rows = []
    CATEGORIES.forEach(cat => {
      for (let m = 1; m <= 12; m++) {
        const amount = parseFloat(budgets[cat.label]?.[m] || 0)
        if (amount > 0) rows.push({ year, month: m, category: cat.label, amount })
      }
    })
    // Upsert
    await supabase.from('budget').delete().eq('year', year)
    if (rows.length > 0) await supabase.from('budget').insert(rows)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Build comparison chart per current month
  const currentMonth = new Date().getMonth() + 1
  const compData = CATEGORIES.map(cat => {
    const budgeted = parseFloat(budgets[cat.label]?.[currentMonth] || 0)
    const real = summary.find(s => s.month === currentMonth)?.expenses_by_category?.[cat.label] || 0
    return { name: cat.icon + ' ' + cat.label.split('/')[0], buget: budgeted, real, color: cat.color }
  }).filter(d => d.buget > 0 || d.real > 0)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Buget</h1>
          <p className="page-sub">Planifică și urmărește bugetul lunar</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="year-select" value={year} onChange={e => setYear(+e.target.value)}>
            {[YEAR - 1, YEAR, YEAR + 1].map(y => <option key={y}>{y}</option>)}
          </select>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={15} /> {saved ? 'Salvat ✓' : saving ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>
      </div>

      {/* Budget vs Real chart */}
      {compData.length > 0 && (
        <div className="chart-card" style={{ marginBottom: 24 }}>
          <h2 className="chart-title">Buget vs Real — {MONTHS[currentMonth - 1]}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={compData} layout="vertical" margin={{ left: 80, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip formatter={v => `${fmt(v)} RON`} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Legend />
              <Bar dataKey="buget" name="Buget" fill="#6366f1" radius={[0, 4, 4, 0]} opacity={0.6} />
              <Bar dataKey="real" name="Real" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Budget table */}
      <div className="table-card" style={{ overflowX: 'auto' }}>
        {loading ? <div className="loading">Se încarcă...</div> : (
          <table className="table budget-table">
            <thead>
              <tr>
                <th style={{ minWidth: 160 }}>Categorie</th>
                {MONTHS.map(m => <th key={m} style={{ minWidth: 90 }}>{m.slice(0, 3)}</th>)}
                <th style={{ minWidth: 100 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map(cat => {
                const total = Array.from({ length: 12 }, (_, i) =>
                  parseFloat(budgets[cat.label]?.[i + 1] || 0)
                ).reduce((s, v) => s + v, 0)
                return (
                  <tr key={cat.id}>
                    <td>
                      <span className="cat-badge" style={{ background: cat.color + '22', color: cat.color }}>
                        {cat.icon} {cat.label}
                      </span>
                    </td>
                    {Array.from({ length: 12 }, (_, i) => (
                      <td key={i}>
                        <input
                          type="number"
                          className="budget-input"
                          value={budgets[cat.label]?.[i + 1] || ''}
                          placeholder="0"
                          onChange={e => setVal(cat.label, i + 1, e.target.value)}
                        />
                      </td>
                    ))}
                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>{fmt(total)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
