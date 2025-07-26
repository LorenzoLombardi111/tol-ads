const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Helper function to get raw body
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(Buffer.from(data, 'utf8'));
    });
    req.on('error', reject);
  });
}

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Important: Disable body parsing for webhooks to get raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  // Check if webhook secret is configured
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('❌ STRIPE_WEBHOOK_SECRET is not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Get the raw body for signature verification
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    console.log('✅ Webhook signature verified');
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('📨 Received webhook event:', event.type);

  // Handle different event types
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('💰 Processing completed checkout session:', session.id);
        await handleSuccessfulPayment(session);
        break;
      
      case 'payment_intent.succeeded':
        console.log('✅ Payment succeeded:', event.data.object.id);
        break;
      
      case 'payment_intent.payment_failed':
        console.log('❌ Payment failed:', event.data.object.id);
        break;
      
      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }

  // Always respond with 200 to acknowledge receipt
  res.status(200).json({ received: true });
}

// Function to handle successful payments
async function handleSuccessfulPayment(session) {
  const { userId, creditsAmount, planId } = session.metadata;

  if (!userId || !creditsAmount) {
    console.error('❌ Missing metadata in session:', session.id);
    throw new Error('Missing required metadata');
  }

  try {
    console.log(`💎 Adding ${creditsAmount} credits to user ${userId}`);

    // Use the database function to safely update credits
    const { data, error } = await supabase.rpc('update_user_credits', {
      target_user_id: userId,
      credit_change: parseInt(creditsAmount),
      transaction_type: 'purchase',
      description: `Purchased ${creditsAmount} credits via Stripe - Session: ${session.id}`,
      admin_id: null
    });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log(`✅ Successfully added ${creditsAmount} credits to user ${userId}`);

  } catch (error) {
    console.error('❌ Error in handleSuccessfulPayment:', error);
    
    // Log this for manual review/retry
    console.error('⚠️ MANUAL REVIEW NEEDED - Failed to add credits:', {
      userId,
      creditsAmount,
      sessionId: session.id,
      error: error.message
    });
    
    throw error; // Re-throw to trigger webhook retry from Stripe
  }
} 