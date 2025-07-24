require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testSignUp() {
  console.log('🧪 Testing Sign Up Functionality...\n');
  
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  
  console.log(`Testing with email: ${testEmail}`);
  
  try {
    // Test sign up
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: 'http://localhost:3000/dashboard'
      }
    });

    if (error) {
      console.error('❌ Sign up failed:', error.message);
      return;
    }

    if (data.user) {
      console.log('✅ Sign up successful!');
      console.log('User ID:', data.user.id);
      console.log('Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
      
      if (!data.user.email_confirmed_at) {
        console.log('📧 Email confirmation required');
      }
    }

    // Test if user was created in the database
    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (creditsError) {
      console.log('⚠️  User credits record not found (this might be expected)');
    } else {
      console.log('✅ User credits record created');
      console.log('💰 Credits available:', userCredits.credits_available);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSignUp(); 