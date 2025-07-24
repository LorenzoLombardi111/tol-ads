-- Diagnose Trigger Function Issues
-- Run this in your Supabase SQL Editor

-- 1. Check if the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_create_user_credits';

-- 2. Check if the function exists
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'create_user_credits';

-- 3. Check recent user_credits records
SELECT 
    user_id,
    credits_available,
    credits_used,
    created_at
FROM user_credits 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Check if there are users without credits
SELECT 
    'Users without credits:' as info,
    COUNT(*) as count
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_credits);

-- 5. Test the function manually (this will show any errors)
SELECT create_user_credits() as function_test; 