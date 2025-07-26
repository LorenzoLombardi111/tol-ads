// Debug script to test webhook configuration
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Webhook Debug Information:');
console.log('=============================');

// Check environment variables
console.log('\n1. Environment Variables Check:');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing');
console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');

// Test Stripe connection
console.log('\n2. Testing Stripe Connection:');
try {
  const account = await stripe.accounts.retrieve();
  console.log('✅ Stripe connection successful');
  console.log('Account ID:', account.id);
} catch (error) {
  console.log('❌ Stripe connection failed:', error.message);
}

// Test Supabase connection
console.log('\n3. Testing Supabase Connection:');
try {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const { data, error } = await supabase.from('users').select('count').limit(1);
  if (error) {
    console.log('❌ Supabase connection failed:', error.message);
  } else {
    console.log('✅ Supabase connection successful');
  }
} catch (error) {
  console.log('❌ Supabase connection failed:', error.message);
}

console.log('\n4. Webhook URL Check:');
console.log('Make sure your webhook URL in Stripe is:');
console.log('https://your-project-name.vercel.app/api/stripe-webhook');

console.log('\n5. Next Steps:');
console.log('- Check Vercel Function Logs in dashboard');
console.log('- Test webhook in Stripe dashboard');
console.log('- Verify webhook events are being sent'); 