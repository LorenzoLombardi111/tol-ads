-- Grant Initial Credits to Existing Users
-- Run this after setting up the main tables

-- Give 10 free credits to all existing users
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