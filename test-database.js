require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with environment variables
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testDatabase() {
  console.log('🔍 Testing Supabase Database Connection...\n');
  console.log('URL:', process.env.REACT_APP_SUPABASE_URL);
  console.log('Key length:', process.env.REACT_APP_SUPABASE_ANON_KEY?.length || 0);

  try {
    // Test 1: Check if user_credits table exists
    console.log('\n1. Checking if user_credits table exists...');
    const { data: creditsData, error: creditsError } = await supabase
      .from('user_credits')
      .select('*')
      .limit(1);
    
    if (creditsError) {
      console.log('❌ user_credits table does not exist or has issues:', creditsError.message);
    } else {
      console.log('✅ user_credits table exists');
    }

    // Test 2: Check if payment_plans table exists
    console.log('\n2. Checking if payment_plans table exists...');
    const { data: plansData, error: plansError } = await supabase
      .from('payment_plans')
      .select('*')
      .limit(1);
    
    if (plansError) {
      console.log('❌ payment_plans table does not exist or has issues:', plansError.message);
    } else {
      console.log('✅ payment_plans table exists');
      console.log('📦 Available plans:', plansData.length);
    }

    // Test 3: Check if credit_transactions table exists
    console.log('\n3. Checking if credit_transactions table exists...');
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('credit_transactions')
      .select('*')
      .limit(1);
    
    if (transactionsError) {
      console.log('❌ credit_transactions table does not exist or has issues:', transactionsError.message);
    } else {
      console.log('✅ credit_transactions table exists');
    }

    // Test 4: Check if user_roles table exists
    console.log('\n4. Checking if user_roles table exists...');
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);
    
    if (rolesError) {
      console.log('❌ user_roles table does not exist or has issues:', rolesError.message);
    } else {
      console.log('✅ user_roles table exists');
    }

    // Test 5: Check if update_user_credits function exists
    console.log('\n5. Testing update_user_credits function...');
    const { data: functionData, error: functionError } = await supabase
      .rpc('update_user_credits', {
        target_user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
        credit_change: 0,
        transaction_type: 'test',
        description: 'Test function call'
      });
    
    if (functionError) {
      console.log('❌ update_user_credits function does not exist or has issues:', functionError.message);
    } else {
      console.log('✅ update_user_credits function exists');
    }

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }

  console.log('\n📋 SUMMARY:');
  console.log('If you see ❌ errors above, you need to run the SQL setup scripts.');
  console.log('Go to your Supabase dashboard and run the contents of supabase-setup.sql');
}

testDatabase();
