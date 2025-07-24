-- Check Trigger Status and Debug Credit Assignment
-- Run this in your Supabase SQL Editor

-- 1. Check if the trigger exists
SELECT 
    'Trigger Status:' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_create_user_credits';

-- 2. Check if the function exists
SELECT 
    'Function Status:' as info,
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'create_user_credits';

-- 3. Check recent user_credits records
SELECT 
    'Recent Credits Records:' as info,
    user_id,
    credits_available,
    credits_used,
    created_at
FROM user_credits 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Check users without credits
SELECT 
    'Users without credits:' as info,
    COUNT(*) as count
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_credits);

-- 5. Check RLS policies
SELECT 
    'RLS Policies:' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_credits';

-- 6. Test the function manually
SELECT 'Testing function...' as info;
SELECT create_user_credits() as function_test; 