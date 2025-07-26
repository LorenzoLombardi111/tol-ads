# Webhook Troubleshooting Guide

## ❌ Current Issue: "Webhook not configured"

The webhook is failing because missing environment variables in Vercel.

## 🔧 Required Environment Variables for Vercel

You need to add these environment variables to your Vercel project:

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Click on your project
- Go to **Settings** → **Environment Variables**

### 2. Add These Variables:

```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 3. Important Notes:
- ✅ **STRIPE_SECRET_KEY**: Your Stripe secret key (starts with `sk_test_` or `sk_live_`)
- ✅ **STRIPE_WEBHOOK_SECRET**: The webhook secret from Stripe (starts with `whsec_`)
- ✅ **SUPABASE_URL**: Your Supabase project URL
- ✅ **SUPABASE_SERVICE_ROLE_KEY**: Your Supabase service role key (NOT the anon key)

## 🔍 How to Get Missing Values:

### Stripe Secret Key:
1. Go to Stripe Dashboard → Developers → API Keys
2. Copy the **Secret key** (starts with `sk_test_`)

### Supabase Service Role Key:
1. Go to Supabase Dashboard → Settings → API
2. Copy the **service_role** key (NOT the anon key)
3. This key has admin privileges needed for the webhook

## 🚀 After Adding Variables:

1. **Redeploy your app** in Vercel
2. **Test a payment** to see if credits are added
3. **Check Vercel logs** for webhook activity

## 📋 Complete Environment Variables List:

```
# Frontend (already have these)
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Backend (need to add these)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## 🔍 Debugging Steps:

1. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Functions
   - Click on the webhook function
   - Check for error messages

2. **Verify Webhook URL**:
   - Make sure it's: `https://your-project.vercel.app/api/stripe-webhook`

3. **Test Webhook**:
   - In Stripe Dashboard → Webhooks
   - Click "Send test webhook"
   - Check if it succeeds

## ✅ Success Indicators:

- ✅ Webhook shows "200 OK" in Stripe
- ✅ Credits are added to user account
- ✅ No errors in Vercel function logs
- ✅ Payment completes successfully 