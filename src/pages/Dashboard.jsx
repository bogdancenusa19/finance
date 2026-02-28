import { useState } from 'react'
import { useMonthlySummary, useTransactions, useIncome } from '../hooks/useData'
import { CATEGORIES, MONTHS } from '../lib/constants'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react'

const YEAR = new Date().getFullYear()

function KPICard({ label, value, sub, icon: Icon, trend, color }) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        <div className="kpi-icon" style={{ background: color + '22', color }}><Icon size={18} /></div>
      </div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub" style={{ color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#94a3b8' }}>{sub}</div>}
    </div>
  )
}

const fmt = (n) => new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON', maximumFractionDigits: 0 }).format(n || 0)

export default function Dashboard() {
  const [year, setYear] = useState(YEAR)
  const { data: summary, loading } = useMonthlySummary(year)
  const { data: transactions } = useTransactions({ year })
  const { data: income } = useIncome(year)

  const totalIncome = income.reduce((s, r) => s + (r.total_income || 0), 0)
  const totalExpenses = summary.reduce((s, r) => s + (r.total_expenses || 0), 0)
  const totalSavings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome * 100).toFixed(1) : 0

  // Chart data
  const areaData = MONTHS.map((m, i) => {
    const s = summary.find(r => r.month === i + 1) || {}
    const inc = income.find(r => r.month === i + 1) || {}
    return {
      name: m.slice(0, 3),
      Venit: inc.total_income || 0,
      Cheltuieli: s.total_expenses || 0,
      Economii: (inc.total_income || 0) - (s.total_expenses || 0),
    }
  })

  // Category breakdown
  const catData = CATEGORIES.map(cat => ({
    name: cat.label,
    value: transactions
      .filter(t => t.category === cat.label)
      .reduce((s, t) => s + t.amount, 0),
    color: cat.color,
    icon: cat.icon,
  })).filter(c => c.value > 0).sort((a, b) => b.value - a.value)

  // Last 5 transactions
  const recent = transactions.slice(0, 6)

  const currentMonth = new Date().getMonth() + 1
  const currentSummary = summary.find(r => r.month === currentMonth) || {}
  const currentIncome = income.find(r => r.month === currentMonth) || {}

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Situația financiară — {year}</p>
        </div>
        <select className="year-select" value={year} onChange={e => setYear(+e.target.value)}>
          {[YEAR - 1, YEAR, YEAR + 1].map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <KPICard label="Venit Total" value={fmt(totalIncome)} icon={Wallet} color="#6366f1"
          sub={`Luna curentă: ${fmt(currentIncome.total_income)}`} />
        <KPICard label="Cheltuieli Totale" value={fmt(totalExpenses)} icon={TrendingDown} color="#ef4444"
          sub={`Luna curentă: ${fmt(currentSummary.total_expenses)}`} trend="down" />
        <KPICard label="Economii Totale" value={fmt(totalSavings)} icon={PiggyBank} color="#10b981"
          sub={totalSavings >= 0 ? '↑ pozitiv' : '↓ deficit'} trend={totalSavings >= 0 ? 'up' : 'down'} />
        <KPICard label="Rată Economii" value={`${savingsRate}%`} icon={TrendingUp} color="#f59e0b"
          sub="din venitul total" />
      </div>

      {/* Charts row */}
      <div className="charts-row">
        {/* Area chart */}
        <div className="chart-card wide">
          <h2 className="chart-title">Venit vs Cheltuieli</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={areaData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gVenit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gChelt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="Venit" stroke="#6366f1" fill="url(#gVenit)" strokeWidth={2} />
              <Area type="monotone" dataKey="Cheltuieli" stroke="#ef4444" fill="url(#gChelt)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="chart-card">
          <h2 className="chart-title">Cheltuieli pe categorii</h2>
          {catData.length === 0 ? (
            <div className="empty-state">Nicio tranzacție înregistrată</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    dataKey="value" paddingAngle={3}>
                    {catData.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="cat-legend">
                {catData.slice(0, 5).map((c, i) => (
                  <div key={i} className="cat-legend-item">
                    <span className="cat-dot" style={{ background: c.color }} />
                    <span className="cat-name">{c.icon} {c.name}</span>
                    <span className="cat-val">{fmt(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Savings bar + Recent */}
      <div className="charts-row">
        <div className="chart-card wide">
          <h2 className="chart-title">Economii lunare (RON)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={areaData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="Economii" radius={[4, 4, 0, 0]}>
                {areaData.map((entry, i) => (
                  <Cell key={i} fill={entry.Economii >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Tranzacții recente</h2>
          <div className="recent-list">
            {recent.length === 0 && <div className="empty-state">Nicio tranzacție</div>}
            {recent.map(t => {
              const cat = CATEGORIES.find(c => c.label === t.category) || CATEGORIES[7]
              return (
                <div key={t.id} className="recent-item">
                  <div className="recent-icon" style={{ background: cat.color + '22', color: cat.color }}>{cat.icon}</div>
                  <div className="recent-info">
                    <div className="recent-desc">{t.description || t.category}</div>
                    <div className="recent-date">{new Date(t.date).toLocaleDateString('ro-RO')}</div>
                  </div>
                  <div className="recent-amount">-{fmt(t.amount)}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
