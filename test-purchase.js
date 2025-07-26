// Test script to debug purchase issues
// Run this with: node test-purchase.js

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testPurchaseFlow() {
  console.log('🔍 Testing Purchase Flow...\n');

  // 1. Check environment variables
  console.log('1. Checking environment variables:');
  console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? 'Set' : 'NOT SET');
  console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set' : 'NOT SET');
  console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set' : 'NOT SET');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'NOT SET');
  console.log('');

  // 2. Test Supabase connection
  console.log('2. Testing Supabase connection:');
  try {
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.REACT_APP_SUPABASE_ANON_KEY
    );

    const { data: plans, error } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.log('❌ Error fetching plans:', error.message);
    } else {
      console.log('✅ Plans fetched successfully');
      console.log('📦 Available plans:', plans.length);
      plans.forEach(plan => {
        console.log(`   - ${plan.name}: ${plan.credits_included} credits for $${(plan.price_cents / 100).toFixed(2)}`);
      });
    }
  } catch (err) {
    console.log('❌ Supabase connection failed:', err.message);
  }
  console.log('');

  // 3. Test API endpoint
  console.log('3. Testing API endpoint:');
  try {
    const response = await fetch('http://localhost:3000/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: 1, // Assuming plan ID 1 exists
        userId: 'test-user-id',
      }),
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
  } catch (err) {
    console.log('❌ API test failed:', err.message);
  }
  console.log('');

  console.log('📋 SUMMARY:');
  console.log('If you see errors above, check:');
  console.log('- Environment variables are set correctly');
  console.log('- Supabase database has payment_plans table with data');
  console.log('- API endpoint is accessible');
  console.log('- Stripe keys are valid');
}

testPurchaseFlow().catch(console.error); 