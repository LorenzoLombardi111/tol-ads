// Test the API endpoint
const fetch = require('node-fetch');

async function testAPI() {
  console.log('🧪 Testing API endpoint...\n');

  try {
    const response = await fetch('https://your-domain.vercel.app/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: 1,
        userId: 'test-user-123',
      }),
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('✅ API is working!');
    } else {
      console.log('❌ API error:', data.error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testAPI(); 