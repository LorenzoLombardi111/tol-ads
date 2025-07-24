import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Debug logging
console.log('Environment variables check:')
console.log('REACT_APP_SUPABASE_URL:', supabaseUrl ? 'Set' : 'NOT SET')
console.log('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'NOT SET')

if (!supabaseUrl) {
  console.error('❌ REACT_APP_SUPABASE_URL is missing!')
  console.error('Please create a .env.local file with your Supabase credentials.')
  console.error('See env-template.txt for instructions.')
}

if (!supabaseAnonKey) {
  console.error('❌ REACT_APP_SUPABASE_ANON_KEY is missing!')
  console.error('Please create a .env.local file with your Supabase credentials.')
  console.error('See env-template.txt for instructions.')
}

// Don't throw errors immediately, let the app handle them gracefully

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 