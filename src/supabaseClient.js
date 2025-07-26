import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('REACT_APP_SUPABASE_URL is missing! Please check your environment variables.');
}

if (!supabaseAnonKey) {
  throw new Error('REACT_APP_SUPABASE_ANON_KEY is missing! Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 