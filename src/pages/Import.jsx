import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES, detectCategory } from '../lib/constants'
import Papa from 'papaparse'
import { Upload, CheckCircle, AlertCircle, FileText, Trash2 } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(n || 0)

function parseBTDate(str) {
  if (!str) return null
  const clean = str.trim()
  // dd.mm.yyyy
  const m1 = clean.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (m1) return `${m1[3]}-${m1[2]}-${m1[1]}`
  // yyyy-mm-dd
  const m2 = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m2) return clean
  return null
}

function parseBTCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: ({ data, meta }) => {
        const cols = meta.fields.map(f => f.toLowerCase().trim())
        const findCol = (names) => meta.fields.find((_, i) => names.includes(cols[i]))

        const colDate = findCol(['data tranzactiei','data','date','data_tranzactiei'])
        const colDesc = findCol(['detalii','descriere','description','narativ','informatii_plata','detalii_tranzactie'])
        const colDebit = findCol(['debit'])
        const colCredit = findCol(['credit'])
        const colAmount = findCol(['suma','valoare','amount'])

        const rows = []
        for (const row of data) {
          const dateStr = parseBTDate(row[colDate])
          if (!dateStr) continue

          let amount = 0
          if (colDebit && colCredit) {
            const d = parseFloat((row[colDebit] || '').replace(',', '.').replace(/\s/g, ''))
            if (!d || d <= 0) continue
            amount = d
          } else if (colAmount) {
            amount = Math.abs(parseFloat((row[colAmount] || '').replace(',', '.').replace(/\s/g, '')))
          }
          if (!amount || amount <= 0) continue

          const description = (row[colDesc] || '').trim().slice(0, 150)
          const d = new Date(dateStr)

          rows.push({
            date: dateStr,
            month: d.getMonth() + 1,
            year: d.getFullYear(),
            description,
            amount: Math.round(amount * 100) / 100,
            category: detectCategory(description),
            payment_type: 'Card',
            recurring: false,
          })
        }
        resolve(rows)
      },
      error: reject
    })
  })
}

export default function Import() {
  const [rows, setRows] = useState([])
  const [step, setStep] = useState('upload') // upload | review | done
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  async function handleFile(file) {
    if (!file || !file.name.toLowerCase().endsWith('.csv')) return
    try {
      const parsed = await parseBTCsv(file)
      setRows(parsed.map(r => ({ ...r, selected: true })))
      setStep('review')
    } catch (e) {
      alert('Eroare la parsarea CSV-ului: ' + e.message)
    }
  }

  function toggleRow(i) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, selected: !r.selected } : r))
  }

  function updateCategory(i, cat) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, category: cat } : r))
  }

  async function handleImport() {
    const selected = rows.filter(r => r.selected).map(({ selected, ...r }) => r)
    if (selected.length === 0) return
    setImporting(true)

    // Deduplicare vs ce e deja in baza
    const { data: existing } = await supabase
      .from('transactions')
      .select('date, amount')
      .in('date', [...new Set(selected.map(r => r.date))])

    const existingSet = new Set((existing || []).map(e => `${e.date}_${e.amount}`))
    const newRows = selected.filter(r => !existingSet.has(`${r.date}_${r.amount}`))
    const dupes = selected.length - newRows.length

    let added = 0
    if (newRows.length > 0) {
      const { error } = await supabase.from('transactions').insert(newRows)
      if (!error) added = newRows.length
    }

    setResult({ added, dupes })
    setImporting(false)
    setStep('done')
  }

  if (step === 'done') return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Import BT</h1>
      </div>
      <div className="result-card">
        <CheckCircle size={48} color="#10b981" />
        <h2>Import complet!</h2>
        <p><strong>{result.added}</strong> tranzacții adăugate</p>
        {result.dupes > 0 && <p style={{ color: '#94a3b8' }}>{result.dupes} duplicate sărite</p>}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button className="btn-ghost" onClick={() => { setStep('upload'); setRows([]); setResult(null) }}>
            Importă alt fișier
          </button>
          <a href="/transactions" className="btn-primary" style={{ textDecoration: 'none' }}>
            Vezi tranzacții →
          </a>
        </div>
      </div>
    </div>
  )

  if (step === 'review') return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Review import</h1>
          <p className="page-sub">{rows.filter(r => r.selected).length} din {rows.length} selectate</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" onClick={() => setStep('upload')}>← Înapoi</button>
          <button className="btn-primary" onClick={handleImport} disabled={importing}>
            {importing ? 'Se importă...' : `Importă ${rows.filter(r => r.selected).length} tranzacții`}
          </button>
        </div>
      </div>

      <div className="table-card" style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input type="checkbox"
                  checked={rows.every(r => r.selected)}
                  onChange={e => setRows(prev => prev.map(r => ({ ...r, selected: e.target.checked })))} />
              </th>
              <th>Data</th><th>Descriere</th><th>Categorie</th><th style={{ textAlign: 'right' }}>Sumă</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const cat = CATEGORIES.find(c => c.label === r.category) || CATEGORIES[7]
              return (
                <tr key={i} style={{ opacity: r.selected ? 1 : 0.4 }}>
                  <td><input type="checkbox" checked={r.selected} onChange={() => toggleRow(i)} /></td>
                  <td className="td-date">{new Date(r.date).toLocaleDateString('ro-RO')}</td>
                  <td className="td-desc">{r.description || '—'}</td>
                  <td>
                    <select className="cat-select" value={r.category}
                      style={{ background: cat.color + '22', color: cat.color }}
                      onChange={e => updateCategory(i, e.target.value)}>
                      {CATEGORIES.map(c => <option key={c.id}>{c.label}</option>)}
                    </select>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#ef4444' }}>-{fmt(r.amount)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Import BT</h1>
          <p className="page-sub">Încarcă extrasul de cont din BT24</p>
        </div>
      </div>

      <div
        className={`dropzone ${dragOver ? 'drag-over' : ''}`}
        onClick={() => fileRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
      >
        <FileText size={40} color="#6366f1" />
        <h3>Trage CSV-ul aici sau click pentru a selecta</h3>
        <p>Export din BT24 → Conturi → Căutare tranzacții → Export CSV</p>
        <input ref={fileRef} type="file" accept=".csv" hidden onChange={e => handleFile(e.target.files[0])} />
      </div>

      <div className="info-box">
        <AlertCircle size={16} />
        <div>
          <strong>Cum descarci extrasul din BT24:</strong>
          <ol>
            <li>Loghează-te pe <a href="https://bt24.bancatransilvania.ro" target="_blank" rel="noreferrer">bt24.bancatransilvania.ro</a></li>
            <li>Conturi → Căutare tranzacții</li>
            <li>Setează perioada dorită</li>
            <li>Click „Export" → CSV</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
