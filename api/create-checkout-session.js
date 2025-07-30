import Stripe from 'stripe';

export default async function handler(req, res) {
  console.log('🔍 API: Request received:', req.method, req.url);
  console.log('🔍 API: Request body:', req.body);
  console.log('🔍 API: Environment variables check:');
  console.log('🔍 API: STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
  console.log('🔍 API: SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
  console.log('🔍 API: SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔍 API: Handling OPTIONS request');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    console.log('❌ API: Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, userId } = req.body;
    console.log('🔍 API: Extracted planId:', planId, 'userId:', userId);

    // Basic validation
    if (!planId || !userId) {
      console.log('❌ API: Missing planId or userId');
      return res.status(400).json({ error: 'Missing planId or userId' });
    }

    // Check environment variables
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🔍 API: Environment variables:');
    console.log('🔍 API: stripeSecretKey exists:', !!stripeSecretKey);
    console.log('🔍 API: supabaseUrl exists:', !!supabaseUrl);
    console.log('🔍 API: supabaseServiceKey exists:', !!supabaseServiceKey);

    if (!stripeSecretKey) {
      console.error('❌ API: STRIPE_SECRET_KEY missing');
      return res.status(500).json({ error: 'Payment service not configured' });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ API: Supabase credentials missing');
      return res.status(500).json({ error: 'Database service not configured' });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey);
    console.log('🔍 API: Stripe initialized');

    // Initialize Supabase
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('🔍 API: Supabase initialized');

    // Get plan details
    console.log('🔍 API: Fetching plan with ID:', planId);
    const { data: plan, error: planError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    console.log('🔍 API: Plan query result:', { plan, planError });

    if (planError || !plan) {
      console.error('❌ API: Plan not found:', planError);
      return res.status(404).json({ error: 'Payment plan not found' });
    }

    console.log('🔍 API: Plan found:', plan);

    // Create checkout session
    console.log('🔍 API: Creating Stripe checkout session');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: `${plan.credits_included} ad generation credits`,
            },
            unit_amount: plan.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'https://your-domain.vercel.app'}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'https://your-domain.vercel.app'}/dashboard?canceled=true`,
      metadata: {
        userId: userId,
        planId: planId.toString(),
        creditsAmount: plan.credits_included.toString(),
      },
    });

    console.log('🔍 API: Stripe session created:', session.id);
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('❌ API: Checkout error:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
} 