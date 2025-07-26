# Environment Variables Setup Guide

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy these values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

## Step 2: Get Your Stripe Credentials

1. Go to your Stripe Dashboard: https://dashboard.stripe.com
2. Go to Developers → API Keys
3. Copy these values:
   - **Publishable key** (starts with `pk_live_...`)
   - **Secret key** (starts with `sk_live_...`)

## Step 3: Add to Vercel

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:

```
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key_here
REACT_APP_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ad-generation
```

## Step 4: Test

After adding the variables, Vercel will automatically redeploy. Then test:

1. Visit: `https://your-domain.vercel.app/api/debug-env`
2. You should see all variables marked as "SET"
3. Try the purchase flow again

## Common Issues:

- **Use service_role key, not anon key** for the API
- **Use live Stripe keys, not test keys** for production
- **Make sure to save** the environment variables in Vercel
- **Wait for redeploy** after adding variables 