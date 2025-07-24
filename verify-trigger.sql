-- Verify Trigger Setup
-- Run this in your Supabase SQL Editor

-- 1. Check trigger status
SELECT '=== TRIGGER STATUS ===' as section;

SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_create_user_credits';

-- 2. Check function status
SELECT '=== FUNCTION STATUS ===' as section;

SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'create_user_credits';

-- 3. Check RLS policies
SELECT '=== RLS POLICIES ===' as section;

SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_credits';

-- 4. Check current credits
SELECT '=== CURRENT CREDITS ===' as section;

SELECT 
    COUNT(*) as total_credits_records,
    COUNT(DISTINCT user_id) as unique_users_with_credits
FROM user_credits;

-- 5. Check users without credits
SELECT '=== USERS WITHOUT CREDITS ===' as section;

SELECT 
    COUNT(*) as users_without_credits
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_credits);

-- 6. Show recent credits
SELECT '=== RECENT CREDITS ===' as section;

SELECT 
    user_id,
    credits_available,
    credits_used,
    created_at
FROM user_credits 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Summary
SELECT '=== SUMMARY ===' as section;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_create_user_credits')
        THEN '✅ Trigger exists'
        ELSE '❌ Trigger missing'
    END as trigger_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'create_user_credits')
        THEN '✅ Function exists'
        ELSE '❌ Function missing'
    END as function_status,
    
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Credits table has data'
        ELSE '❌ Credits table empty'
    END as credits_status
FROM user_credits; 