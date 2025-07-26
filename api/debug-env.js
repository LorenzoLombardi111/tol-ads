export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check all environment variables
  const envCheck = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'SET' : 'MISSING',
    SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
    REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL ? 'SET' : 'MISSING',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
    REACT_APP_STRIPE_PUBLISHABLE_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ? 'SET' : 'MISSING',
    REACT_APP_N8N_WEBHOOK_URL: process.env.REACT_APP_N8N_WEBHOOK_URL ? 'SET' : 'MISSING',
  };

  // Check if we can connect to Supabase
  let supabaseConnection = 'NOT TESTED';
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      
      const { data, error } = await supabase
        .from('payment_plans')
        .select('count')
        .limit(1);
      
      if (error) {
        supabaseConnection = `ERROR: ${error.message}`;
      } else {
        supabaseConnection = 'SUCCESS';
      }
    } else {
      supabaseConnection = 'MISSING CREDENTIALS';
    }
  } catch (error) {
    supabaseConnection = `ERROR: ${error.message}`;
  }

  res.status(200).json({
    environment: envCheck,
    supabaseConnection,
    timestamp: new Date().toISOString()
  });
} 