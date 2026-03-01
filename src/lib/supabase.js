import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://cmvqmtfyiugnhcnsuojn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtdnFtdGZ5aXVnbmhjbnN1b2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyODI5MzQsImV4cCI6MjA4Nzg1ODkzNH0.pW8v8gB2L_lU9s-Kqdx2zFGF6w9MS6pk6OyG3Zhs9UE'
)
