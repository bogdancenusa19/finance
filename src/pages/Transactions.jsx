import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useTransactions } from '../hooks/useData'
import { CATEGORIES, MONTHS, PAYMENT_TYPES } from '../lib/constants'
import { Plus, Trash2, X, Search } from 'lucide-react'

const YEAR = new Date().getFullYear()
const fmt = (n) => new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(n || 0)

const empty = {
  date: new Date().toISOString().slice(0, 10),
  category: 'Altele',
  description: '',
  amount: '',
  payment_type: 'Card',
  recurring: false,
  notes: '',
}

export default function Transactions() {
  const [year, setYear] = useState(YEAR)
  const [month, setMonth] = useState(0)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const filters = { year, ...(month ? { month } : {}) }
  const { data, loading, refetch } = useTransactions(filters)

  const filtered = data.filter(t =>
    !search || t.description?.toLowerCase().includes(search.toLowerCase()) ||
    t.category?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSave() {
    if (!form.amount || !form.date) return
    setSaving(true)
    const d = new Date(form.date)
    await supabase.from('transactions').insert({
      date: form.date,
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      category: form.category,
      description: form.description,
      amount: parseFloat(form.amount),
      payment_type: form.payment_type,
      recurring: form.recurring,
      notes: form.notes,
    })
    setSaving(false)
    setShowForm(false)
    setForm(empty)
    refetch()
  }

  async function handleDelete(id) {
    setDeleting(id)
    await supabase.from('transactions').delete().eq('id', id)
    setDeleting(null)
    refetch()
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tranzacții</h1>
          <p className="page-sub">{filtered.length} înregistrări</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Adaugă
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input className="search-input" placeholder="Caută..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={year} onChange={e => setYear(+e.target.value)}>
          {[YEAR - 1, YEAR, YEAR + 1].map(y => <option key={y}>{y}</option>)}
        </select>
        <select className="filter-select" value={month} onChange={e => setMonth(+e.target.value)}>
          <option value={0}>Toate lunile</option>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="table-card">
        {loading ? (
          <div className="loading">Se încarcă...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">Nicio tranzacție găsită</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Data</th><th>Categorie</th><th>Descriere</th>
                <th>Tip</th><th>Recurent</th><th style={{textAlign:'right'}}>Sumă</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const cat = CATEGORIES.find(c => c.label === t.category) || CATEGORIES[7]
                return (
                  <tr key={t.id}>
                    <td className="td-date">{new Date(t.date).toLocaleDateString('ro-RO')}</td>
                    <td>
                      <span className="cat-badge" style={{ background: cat.color + '22', color: cat.color }}>
                        {cat.icon} {t.category}
                      </span>
                    </td>
                    <td className="td-desc">{t.description || '—'}</td>
                    <td><span className="badge">{t.payment_type || 'Card'}</span></td>
                    <td><span className={`badge ${t.recurring ? 'badge-green' : ''}`}>{t.recurring ? 'Da' : 'Nu'}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#ef4444' }}>-{fmt(t.amount)}</td>
                    <td>
                      <button className="icon-btn danger" disabled={deleting === t.id}
                        onClick={() => handleDelete(t.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tranzacție nouă</h3>
              <button className="icon-btn" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Data</label>
                <input type="date" className="form-input" value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Sumă (RON)</label>
                <input type="number" className="form-input" placeholder="0.00" value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="form-group full">
                <label>Categorie</label>
                <select className="form-input" value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group full">
                <label>Descriere</label>
                <input className="form-input" placeholder="ex: Kaufland weekend" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Tip plată</label>
                <select className="form-input" value={form.payment_type}
                  onChange={e => setForm({ ...form, payment_type: e.target.value })}>
                  {PAYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ marginBottom: 0 }}>Recurent</label>
                <input type="checkbox" checked={form.recurring}
                  onChange={e => setForm({ ...form, recurring: e.target.checked })} />
              </div>
              <div className="form-group full">
                <label>Note</label>
                <input className="form-input" placeholder="opțional" value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowForm(false)}>Anulează</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Se salvează...' : 'Salvează'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
