import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'

const PRESET_ICONS = ['🏠','🛒','🚗','📱','🎬','💊','📈','📦','✈️','🎓','💻','🐾','👗','🍽️','🎮','🏋️','💰','🔧','🎁','📚']
const PRESET_COLORS = ['#6366f1','#f59e0b','#3b82f6','#8b5cf6','#ec4899','#10b981','#06b6d4','#94a3b8','#ef4444','#84cc16','#f97316','#14b8a6']

function ColorPicker({ value, onChange }) {
  return (
    <div className="color-grid">
      {PRESET_COLORS.map(c => (
        <button
          key={c}
          className={`color-dot ${value === c ? 'selected' : ''}`}
          style={{ background: c }}
          onClick={() => onChange(c)}
        />
      ))}
    </div>
  )
}

function IconPicker({ value, onChange }) {
  return (
    <div className="icon-grid">
      {PRESET_ICONS.map(ic => (
        <button
          key={ic}
          className={`icon-dot ${value === ic ? 'selected' : ''}`}
          onClick={() => onChange(ic)}
        >
          {ic}
        </button>
      ))}
    </div>
  )
}

function CategoryRow({ cat, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(cat.name)
  const [icon, setIcon] = useState(cat.icon)
  const [color, setColor] = useState(cat.color)

  async function save() {
    await onUpdate(cat.id, { name, icon, color })
    setEditing(false)
  }

  if (editing) return (
    <div className="cat-edit-row">
      <div className="cat-edit-preview" style={{ background: color + '18', color }}>
        {icon} {name}
      </div>
      <div className="cat-edit-fields">
        <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="Nume categorie" />
        <div className="pickers-row">
          <div>
            <div className="picker-label">Icona</div>
            <IconPicker value={icon} onChange={setIcon} />
          </div>
          <div>
            <div className="picker-label">Culoare</div>
            <ColorPicker value={color} onChange={setColor} />
          </div>
        </div>
        <div className="edit-actions">
          <button className="btn-ghost small" onClick={() => setEditing(false)}><X size={14} /> Anuleaza</button>
          <button className="btn-primary small" onClick={save}><Check size={14} /> Salveaza</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="cat-row-item">
      <span className="cat-tag" style={{ background: cat.color + '18', color: cat.color }}>
        {cat.icon} {cat.name}
      </span>
      <div className="cat-row-actions">
        <button className="icon-btn" onClick={() => setEditing(true)}><Pencil size={14} /></button>
        <button className="icon-btn danger" onClick={() => onDelete(cat.id)}><Trash2 size={14} /></button>
      </div>
    </div>
  )
}

export default function Admin() {
  const { categories, addCategory, deleteCategory, updateCategory } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('📦')
  const [newColor, setNewColor] = useState('#6366f1')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!newName.trim()) return
    setSaving(true)
    await addCategory({ name: newName.trim(), icon: newIcon, color: newColor })
    setNewName('')
    setNewIcon('📦')
    setNewColor('#6366f1')
    setShowAdd(false)
    setSaving(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Setari</h1>
          <p className="page-sub">Gestioneaza categoriile si preferintele</p>
        </div>
      </div>

      <div className="admin-section">
        <div className="section-header">
          <div>
            <h2>Categorii</h2>
            <p>Personalizeaza categoriile de cheltuieli</p>
          </div>
          <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={15} /> Categorie noua
          </button>
        </div>

        {showAdd && (
          <div className="add-cat-card">
            <div className="field">
              <label>Nume categorie</label>
              <input
                className="field-input"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                autoFocus
              />
            </div>
            <div className="pickers-row">
              <div>
                <div className="picker-label">Icona</div>
                <IconPicker value={newIcon} onChange={setNewIcon} />
              </div>
              <div>
                <div className="picker-label">Culoare</div>
                <ColorPicker value={newColor} onChange={setNewColor} />
              </div>
            </div>
            <div className="add-preview">
              Previzualizare: <span className="cat-tag" style={{ background: newColor + '18', color: newColor }}>{newIcon} {newName || 'Categorie noua'}</span>
            </div>
            <div className="edit-actions">
              <button className="btn-ghost small" onClick={() => setShowAdd(false)}><X size={14} /> Anuleaza</button>
              <button className="btn-primary small" onClick={handleAdd} disabled={saving || !newName.trim()}>
                <Check size={14} /> Adauga
              </button>
            </div>
          </div>
        )}

        <div className="cat-list-admin">
          {categories.map(cat => (
            <CategoryRow
              key={cat.id}
              cat={cat}
              onDelete={deleteCategory}
              onUpdate={updateCategory}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
