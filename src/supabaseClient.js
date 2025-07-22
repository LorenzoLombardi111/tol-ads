import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Debug logging
console.log('Environment variables check:')
console.log('REACT_APP_SUPABASE_URL:', supabaseUrl ? 'Set' : 'NOT SET')
console.log('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'NOT SET')

if (!supabaseUrl) {
  throw new Error('REACT_APP_SUPABASE_URL is required. Please check your .env.local file.')
}

if (!supabaseAnonKey) {
  throw new Error('REACT_APP_SUPABASE_ANON_KEY is required. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 