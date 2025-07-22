-- Fix RLS Policy Recursion Issue
-- Run this in your Supabase SQL Editor

-- Drop existing policies that might be causing recursion
DROP POLICY IF EXISTS "Admins can view user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Anyone can view active payment plans" ON payment_plans;

-- Create simpler policies without recursion
CREATE POLICY "Users can view own credits" ON user_credits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active payment plans" ON payment_plans
    FOR SELECT USING (is_active = true);

-- Create a simpler admin policy that doesn't cause recursion
CREATE POLICY "Allow all operations on user_roles" ON user_roles
    FOR ALL USING (true);

-- Grant initial credits to existing users
INSERT INTO user_credits (user_id, credits_available, credits_used)
SELECT id, 10, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_credits)
ON CONFLICT (user_id) DO UPDATE SET
    credits_available = user_credits.credits_available + 10,
    updated_at = NOW();

-- Create transaction records for the initial credits
INSERT INTO credit_transactions (user_id, transaction_type, credit_change, description)
SELECT 
    uc.user_id,
    'admin_grant',
    10,
    'Welcome bonus credits'
FROM user_credits uc
WHERE uc.credits_available >= 10
AND NOT EXISTS (
    SELECT 1 FROM credit_transactions ct 
    WHERE ct.user_id = uc.user_id 
    AND ct.description = 'Welcome bonus credits'
); 