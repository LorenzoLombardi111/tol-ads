# Stripe Webhook Setup Guide

## The Problem
Your payment went through on Stripe, but credits aren't being added to your account. This means the webhook isn't working.

## Step 1: Get Your Webhook Secret

1. Go to your **Stripe Dashboard**: https://dashboard.stripe.com
2. Go to **Developers → Webhooks**
3. Click **Add endpoint**
4. Set the endpoint URL to: `https://your-domain.vercel.app/api/stripe-webhook`
5. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
6. Click **Add endpoint**
7. **Copy the webhook signing secret** (starts with `whsec_...`)

## Step 2: Add to Vercel Environment Variables

1. Go to your **Vercel Dashboard**
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add this variable:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

## Step 3: Test the Webhook

1. In Stripe Dashboard, go to your webhook
2. Click **Send test webhook**
3. Select `checkout.session.completed`
4. Send the test
5. Check Vercel logs for the webhook response

## Step 4: Manual Credit Addition (If Needed)

If the webhook still doesn't work, you can manually add credits:

1. Go to your Supabase Dashboard
2. Go to **SQL Editor**
3. Run this query (replace with your user ID and credits):
   ```sql
   SELECT update_user_credits(
     'your-user-id-here',
     100, -- number of credits to add
     'purchase',
     'Manual credit addition for Stripe payment',
     NULL
   );
   ```

## Step 5: Verify

1. Check your app - credits should now appear
2. Check Vercel logs for webhook activity
3. Test a new purchase to ensure it works

## Common Issues:

- **Wrong webhook URL** - Make sure it points to your Vercel domain
- **Missing webhook secret** - Must be added to Vercel environment variables
- **Wrong events selected** - Need `checkout.session.completed`
- **DNS issues** - Make sure your domain resolves correctly

## Debug Steps:

1. Check Vercel logs for webhook errors
2. Verify webhook secret is set correctly
3. Test webhook in Stripe dashboard
4. Check Supabase logs for database errors 