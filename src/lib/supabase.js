import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://cmvqmtfyiugnhcnsuojn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtdnFtdGZ5MXVnbmhjbnN1b2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTU2NzUsImV4cCI6MjA1ODU3MTY3NX0.pw8v8gB2l_1U9s-Kqdx2zFGF6w9MS6pk6OyG3Zhs9UE'
)
