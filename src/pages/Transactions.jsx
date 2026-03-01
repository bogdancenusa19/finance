import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../contexts/AppContext'
import { useTransactions } from '../hooks/useData'
import { fmt, MONTHS, PAYMENT_TYPES } from '../lib/utils'
import { Plus, Trash2, X, Search } from 'lucide-react'

const YEAR = new Date().getFullYear()

const emptyForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  category: '',
  description: '',
  amount: '',
  payment_type: 'Card',
  recurring: false,
  notes: '',
})

export default function Transactions() {
  const { categories } = useApp()
  const [year, setYear] = useState(YEAR)
  const [month, setMonth] = useState(0)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const { data, loading, refetch } = useTransactions({ year, ...(month ? { month } : {}) })

  const filtered = data.filter(t =>
    !search ||
    t.description?.toLowerCase().includes(search.toLowerCase()) ||
    t.category?.toLowerCase().includes(search.toLowerCase())
  )

  function openForm() {
    setForm({ ...emptyForm(), category: categories[0]?.name || '' })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.amount || !form.date || !form.category) return
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
    refetch()
  }

  async function handleDelete(id) {
    setDeleting(id)
    await supabase.from('transactions').delete().eq('id', id)
    setDeleting(null)
    refetch()
  }

  const totalFiltered = filtered.reduce((s, t) => s + t.amount, 0)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Tranzactii</h1>
          <p className="page-sub">{filtered.length} inregistrari · {fmt(totalFiltered)}</p>
        </div>
        <button className="btn-primary" onClick={openForm}>
          <Plus size={16} /> Adauga
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input placeholder="Cauta tranzactii..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" value={year} onChange={e => setYear(+e.target.value)}>
          {[YEAR-1, YEAR, YEAR+1].map(y => <option key={y}>{y}</option>)}
        </select>
        <select className="select" value={month} onChange={e => setMonth(+e.target.value)}>
          <option value={0}>Toate lunile</option>
          {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
        </select>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="empty">Se incarca...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">Nicio tranzactie gasita</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Categorie</th>
                <th>Descriere</th>
                <th>Tip</th>
                <th style={{ textAlign: 'right' }}>Suma</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const cat = categories.find(c => c.name === t.category)
                return (
                  <tr key={t.id}>
                    <td className="td-muted">{new Date(t.date).toLocaleDateString('ro-RO')}</td>
                    <td>
                      {cat ? (
                        <span className="cat-tag" style={{ background: cat.color + '18', color: cat.color }}>
                          {cat.icon} {cat.name}
                        </span>
                      ) : (
                        <span className="cat-tag">{t.category}</span>
                      )}
                    </td>
                    <td className="td-desc">{t.description || ''}</td>
                    <td><span className="badge">{t.payment_type || 'Card'}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#ef4444' }}>{fmt(t.amount)}</td>
                    <td>
                      <button className="icon-btn danger" disabled={deleting === t.id} onClick={() => handleDelete(t.id)}>
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

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Tranzactie noua</h3>
              <button className="icon-btn" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="field">
                  <label>Data</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="field">
                  <label>Suma (RON)</label>
                  <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div className="field full">
                  <label>Categorie</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div className="field full">
                  <label>Descriere</label>
                  <input placeholder="ex: Kaufland, weekend" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="field">
                  <label>Tip plata</label>
                  <select value={form.payment_type} onChange={e => setForm({ ...form, payment_type: e.target.value })}>
                    {PAYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="field checkbox-field">
                  <label>
                    <input type="checkbox" checked={form.recurring} onChange={e => setForm({ ...form, recurring: e.target.checked })} />
                    Tranzactie recurenta
                  </label>
                </div>
                <div className="field full">
                  <label>Note</label>
                  <input placeholder="Optionale" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-ghost" onClick={() => setShowForm(false)}>Anuleaza</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Se salveaza...' : 'Salveaza'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
