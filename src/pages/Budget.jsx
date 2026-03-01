import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../contexts/AppContext'
import { useBudget, useTransactions } from '../hooks/useData'
import { fmt, MONTHS } from '../lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import { Save, CheckCircle } from 'lucide-react'

const YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() + 1

export default function Budget() {
  const { categories } = useApp()
  const [year, setYear] = useState(YEAR)
  const { data: budgetData } = useBudget(year)
  const { data: transactions } = useTransactions({ year })
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
    setBudgets(prev => ({ ...prev, [cat]: { ...(prev[cat] || {}), [month]: val } }))
  }

  async function handleSave() {
    setSaving(true)
    const rows = []
    categories.forEach(cat => {
      for (let m = 1; m <= 12; m++) {
        const amount = parseFloat(budgets[cat.name]?.[m] || 0)
        if (amount > 0) rows.push({ year, month: m, category: cat.name, amount })
      }
    })
    await supabase.from('budget').delete().eq('year', year)
    if (rows.length > 0) await supabase.from('budget').insert(rows)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const compData = categories.map(cat => {
    const budgeted = parseFloat(budgets[cat.name]?.[CURRENT_MONTH] || 0)
    const real = transactions
      .filter(t => t.month === CURRENT_MONTH && t.category === cat.name)
      .reduce((s, t) => s + t.amount, 0)
    return { name: cat.icon + ' ' + cat.name.split('/')[0], buget: budgeted, real, color: cat.color }
  }).filter(d => d.buget > 0 || d.real > 0)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Buget</h1>
          <p className="page-sub">Planifica si urmareste cheltuielile lunare</p>
        </div>
        <div className="header-actions">
          <select className="select" value={year} onChange={e => setYear(+e.target.value)}>
            {[YEAR-1, YEAR, YEAR+1].map(y => <option key={y}>{y}</option>)}
          </select>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saved ? <><CheckCircle size={15} /> Salvat</> : <><Save size={15} /> Salveaza</>}
          </button>
        </div>
      </div>

      {compData.length > 0 && (
        <div className="chart-card" style={{ marginBottom: 24 }}>
          <div className="chart-title">Buget vs Real — {MONTHS[CURRENT_MONTH - 1]}</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={compData} layout="vertical" margin={{ left: 100, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={100} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Legend />
              <Bar dataKey="buget" name="Buget" fill="#6366f1" radius={[0, 4, 4, 0]} opacity={0.5} />
              <Bar dataKey="real"  name="Real"  fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="table-card" style={{ overflowX: 'auto' }}>
        <table className="table budget-table">
          <thead>
            <tr>
              <th style={{ minWidth: 160 }}>Categorie</th>
              {MONTHS.map(m => <th key={m} style={{ minWidth: 90, textAlign: 'right' }}>{m.slice(0, 3)}</th>)}
              <th style={{ minWidth: 100, textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => {
              const total = Array.from({ length: 12 }, (_, i) =>
                parseFloat(budgets[cat.name]?.[i+1] || 0)
              ).reduce((s, v) => s + v, 0)
              return (
                <tr key={cat.id}>
                  <td>
                    <span className="cat-tag" style={{ background: cat.color + '18', color: cat.color }}>
                      {cat.icon} {cat.name}
                    </span>
                  </td>
                  {Array.from({ length: 12 }, (_, i) => (
                    <td key={i} style={{ textAlign: 'right' }}>
                      <input
                        className="budget-input"
                        type="number"
                        value={budgets[cat.name]?.[i+1] || ''}
                        placeholder="0"
                        onChange={e => setVal(cat.name, i+1, e.target.value)}
                      />
                    </td>
                  ))}
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(total)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
