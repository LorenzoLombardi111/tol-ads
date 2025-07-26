// Check Environment Variables
// Run this to verify your environment variables are set correctly

console.log('🔍 Checking Environment Variables...\n');

const requiredVars = [
  'REACT_APP_SUPABASE_URL',
  'REACT_APP_SUPABASE_ANON_KEY', 
  'STRIPE_SECRET_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

let allSet = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Set (${value.substring(0, 20)}...)`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allSet = false;
  }
});

console.log('\n📋 SUMMARY:');
if (allSet) {
  console.log('✅ All environment variables are set!');
} else {
  console.log('❌ Missing environment variables detected.');
  console.log('\nTo fix this:');
  console.log('1. Go to your Vercel dashboard');
  console.log('2. Go to Settings → Environment Variables');
  console.log('3. Add the missing variables');
  console.log('4. Redeploy your project');
} 