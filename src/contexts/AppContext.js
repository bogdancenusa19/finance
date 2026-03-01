import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AppContext = createContext(null)

export function AppProvider({ children, session }) {
  const [categories, setCategories] = useState([])
  const [widgets, setWidgets] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadAll = useCallback(async () => {
    if (!session?.user) return
    setLoading(true)
    const uid = session.user.id

    const [catRes, widRes, setRes] = await Promise.all([
      supabase.from('categories').select('*').eq('user_id', uid).order('sort_order'),
      supabase.from('dashboard_widgets').select('*').eq('user_id', uid).order('position'),
      supabase.from('user_settings').select('*').eq('user_id', uid).single(),
    ])

    // First login: insert defaults
    if (!catRes.data || catRes.data.length === 0) {
      await supabase.rpc('insert_default_data', { p_user_id: uid })
      const [c2, w2, s2] = await Promise.all([
        supabase.from('categories').select('*').eq('user_id', uid).order('sort_order'),
        supabase.from('dashboard_widgets').select('*').eq('user_id', uid).order('position'),
        supabase.from('user_settings').select('*').eq('user_id', uid).single(),
      ])
      setCategories(c2.data || [])
      setWidgets(w2.data || [])
      setSettings(s2.data || {})
    } else {
      setCategories(catRes.data || [])
      setWidgets(widRes.data || [])
      setSettings(setRes.data || {})
    }
    setLoading(false)
  }, [session])

  useEffect(() => { loadAll() }, [loadAll])

  async function updateWidget(widgetType, updates) {
    const uid = session.user.id
    await supabase.from('dashboard_widgets')
      .update(updates)
      .eq('user_id', uid)
      .eq('widget_type', widgetType)
    setWidgets(prev => prev.map(w => w.widget_type === widgetType ? { ...w, ...updates } : w))
  }

  async function addCategory(cat) {
    const uid = session.user.id
    const maxOrder = Math.max(0, ...categories.map(c => c.sort_order))
    const { data } = await supabase.from('categories')
      .insert({ ...cat, user_id: uid, sort_order: maxOrder + 1 })
      .select().single()
    if (data) setCategories(prev => [...prev, data])
    return data
  }

  async function deleteCategory(id) {
    await supabase.from('categories').delete().eq('id', id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  async function updateCategory(id, updates) {
    await supabase.from('categories').update(updates).eq('id', id)
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  async function updateSettings(updates) {
    const uid = session.user.id
    await supabase.from('user_settings').upsert({ user_id: uid, ...settings, ...updates })
    setSettings(prev => ({ ...prev, ...updates }))
  }

  return (
    <AppContext.Provider value={{
      categories, widgets, settings, loading,
      updateWidget, addCategory, deleteCategory, updateCategory,
      updateSettings, refetch: loadAll
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
