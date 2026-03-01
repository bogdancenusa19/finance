import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { useTransactions, useIncome } from '../hooks/useData'
import { fmt, MONTHS, WIDGET_META } from '../lib/utils'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { Wallet, TrendingDown, PiggyBank, TrendingUp, Hash, AlertCircle, Eye, EyeOff } from 'lucide-react'

const YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() + 1

const KPI_ICONS = {
  kpi_venit:         { icon: Wallet,        color: '#6366f1' },
  kpi_cheltuieli:    { icon: TrendingDown,  color: '#ef4444' },
  kpi_economii:      { icon: PiggyBank,     color: '#10b981' },
  kpi_rata_economii: { icon: TrendingUp,    color: '#f59e0b' },
  kpi_tranzactii:    { icon: Hash,          color: '#06b6d4' },
  kpi_cea_mai_mare:  { icon: AlertCircle,   color: '#ec4899' },
}

function KPIWidget({ type, data }) {
  const meta = KPI_ICONS[type]
  if (!meta) return null
  const Icon = meta.icon
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-label">{WIDGET_META[type]?.label}</span>
        <div className="kpi-icon-wrap" style={{ background: meta.color + '20', color: meta.color }}>
          <Icon size={16} />
        </div>
      </div>
      <div className="kpi-value">{data.value}</div>
      {data.sub && <div className="kpi-sub" style={{ color: data.subColor || '#64748b' }}>{data.sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { widgets, categories, updateWidget } = useApp()
  const [year, setYear] = useState(YEAR)
  const [editMode, setEditMode] = useState(false)
  const { data: transactions } = useTransactions({ year })
  const { data: income } = useIncome(year)

  const visibleWidgets = widgets.filter(w => w.visible).sort((a, b) => a.position - b.position)
  const allWidgets = widgets.sort((a, b) => a.position - b.position)

  const totalIncome = income.reduce((s, r) => s + (r.total_income || 0), 0)
  const totalExpenses = transactions.reduce((s, t) => s + t.amount, 0)
  const totalSavings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : 0
  const currentMonthExpenses = transactions.filter(t => t.month === CURRENT_MONTH).reduce((s, t) => s + t.amount, 0)
  const currentMonthIncome = income.find(r => r.month === CURRENT_MONTH)?.total_income || 0
  const maxTransaction = transactions.reduce((max, t) => t.amount > (max?.amount || 0) ? t : max, null)

  const kpiData = {
    kpi_venit:         { value: fmt(totalIncome),       sub: `Luna curenta: ${fmt(currentMonthIncome)}` },
    kpi_cheltuieli:    { value: fmt(totalExpenses),     sub: `Luna curenta: ${fmt(currentMonthExpenses)}`, subColor: '#ef4444' },
    kpi_economii:      { value: fmt(totalSavings),      sub: totalSavings >= 0 ? 'Surplus' : 'Deficit', subColor: totalSavings >= 0 ? '#10b981' : '#ef4444' },
    kpi_rata_economii: { value: `${savingsRate}%`,      sub: 'din venitul total' },
    kpi_tranzactii:    { value: transactions.length,    sub: `in ${year}` },
    kpi_cea_mai_mare:  { value: maxTransaction ? fmt(maxTransaction.amount) : '0 RON', sub: maxTransaction?.description || 'fara tranzactii' },
  }

  const areaData = MONTHS.map((m, i) => {
    const inc = income.find(r => r.month === i + 1)?.total_income || 0
    const exp = transactions.filter(t => t.month === i + 1).reduce((s, t) => s + t.amount, 0)
    return { name: m.slice(0, 3), Venit: inc, Cheltuieli: exp, Economii: inc - exp }
  })

  const catData = categories.map(cat => ({
    name: cat.icon + ' ' + cat.name,
    value: transactions.filter(t => t.category === cat.name).reduce((s, t) => s + t.amount, 0),
    color: cat.color,
  })).filter(c => c.value > 0).sort((a, b) => b.value - a.value)

  const recent = transactions.slice(0, 6)

  function renderWidget(w) {
    const type = w.widget_type
    if (type.startsWith('kpi_')) {
      return <KPIWidget key={type} type={type} data={kpiData[type] || {}} />
    }
    if (type === 'chart_venit_chelt') return (
      <div key={type} className="chart-card wide">
        <div className="chart-title">Venit vs Cheltuieli</div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={areaData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={v => fmt(v)} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="Venit" stroke="#6366f1" fill="url(#gV)" strokeWidth={2} />
            <Area type="monotone" dataKey="Cheltuieli" stroke="#ef4444" fill="url(#gC)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
    if (type === 'chart_categorii') return (
      <div key={type} className="chart-card">
        <div className="chart-title">Cheltuieli pe categorii</div>
        {catData.length === 0 ? (
          <div className="empty">Nicio tranzactie inregistrata</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                  {catData.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="cat-list">
              {catData.slice(0, 5).map((c, i) => (
                <div key={i} className="cat-row">
                  <span className="cat-dot" style={{ background: c.color }} />
                  <span className="cat-name">{c.name}</span>
                  <span className="cat-val">{fmt(c.value)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    )
    if (type === 'chart_economii') return (
      <div key={type} className="chart-card wide">
        <div className="chart-title">Economii lunare</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={areaData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={v => fmt(v)} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="Economii" radius={[4, 4, 0, 0]}>
              {areaData.map((e, i) => <Cell key={i} fill={e.Economii >= 0 ? '#10b981' : '#ef4444'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
    if (type === 'list_recente') return (
      <div key={type} className="chart-card">
        <div className="chart-title">Tranzactii recente</div>
        <div className="recent-list">
          {recent.length === 0 && <div className="empty">Nicio tranzactie</div>}
          {recent.map(t => {
            const cat = categories.find(c => c.name === t.category)
            return (
              <div key={t.id} className="recent-row">
                <div className="recent-icon" style={{ background: (cat?.color || '#94a3b8') + '20', color: cat?.color || '#94a3b8' }}>
                  {cat?.icon || '📦'}
                </div>
                <div className="recent-info">
                  <div className="recent-desc">{t.description || t.category}</div>
                  <div className="recent-date">{new Date(t.date).toLocaleDateString('ro-RO')}</div>
                </div>
                <div className="recent-amount">{fmt(t.amount)}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
    return null
  }

  const kpiWidgets = (editMode ? allWidgets : visibleWidgets).filter(w => w.widget_type.startsWith('kpi_'))
  const chartWidgets = (editMode ? allWidgets : visibleWidgets).filter(w => !w.widget_type.startsWith('kpi_'))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-sub">Situatie financiara {year}</p>
        </div>
        <div className="header-actions">
          <select className="select" value={year} onChange={e => setYear(+e.target.value)}>
            {[YEAR-1, YEAR, YEAR+1].map(y => <option key={y}>{y}</option>)}
          </select>
          <button className={`btn-ghost ${editMode ? 'active' : ''}`} onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Gata' : 'Personalizeaza'}
          </button>
        </div>
      </div>

      {editMode && (
        <div className="edit-banner">
          Apasa pe ochi pentru a arata sau ascunde widget-urile
        </div>
      )}

      <div className="kpi-grid">
        {kpiWidgets.map(w => (
          <div key={w.widget_type} className={`kpi-wrapper ${editMode && !w.visible ? 'dimmed' : ''}`}>
            {editMode && (
              <button className="widget-toggle" onClick={() => updateWidget(w.widget_type, { visible: !w.visible })}>
                {w.visible ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
            )}
            {renderWidget(w)}
          </div>
        ))}
      </div>

      <div className="charts-grid">
        {chartWidgets.map(w => (
          <div key={w.widget_type} className={`chart-wrapper ${editMode && !w.visible ? 'dimmed' : ''}`}>
            {editMode && (
              <button className="widget-toggle" onClick={() => updateWidget(w.widget_type, { visible: !w.visible })}>
                {w.visible ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
            )}
            {renderWidget(w)}
          </div>
        ))}
      </div>
    </div>
  )
}
