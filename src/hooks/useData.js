import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTransactions(filters = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('transactions').select('*').order('date', { ascending: false })
    if (filters.year) q = q.eq('year', filters.year)
    if (filters.month) q = q.eq('month', filters.month)
    if (filters.category) q = q.eq('category', filters.category)
    const { data: rows } = await q
    setData(rows || [])
    setLoading(false)
  }, [filters.year, filters.month, filters.category])

  useEffect(() => { fetch() }, [fetch])
  return { data, loading, refetch: fetch }
}

export function useIncome(year) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data: rows } = await supabase
      .from('income').select('*').eq('year', year).order('month')
    setData(rows || [])
    setLoading(false)
  }, [year])

  useEffect(() => { fetch() }, [fetch])
  return { data, loading, refetch: fetch }
}

export function useBudget(year) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data: rows } = await supabase.from('budget').select('*').eq('year', year)
    setData(rows || [])
    setLoading(false)
  }, [year])

  useEffect(() => { fetch() }, [fetch])
  return { data, loading, refetch: fetch }
}
