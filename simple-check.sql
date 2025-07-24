-- Simple Trigger Check
-- Run this in your Supabase SQL Editor

-- 1. Check if trigger exists
SELECT 'Checking trigger...' as status;

SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_create_user_credits';

-- 2. Check if function exists
SELECT 'Checking function...' as status;

SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'create_user_credits';

-- 3. Check recent credits
SELECT 'Recent credits records:' as status;

SELECT user_id, credits_available, created_at 
FROM user_credits 
ORDER BY created_at DESC 
LIMIT 3;

-- 4. Check users without credits
SELECT 'Users without credits:' as status;

SELECT COUNT(*) as count 
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_credits);

-- 5. Done
SELECT 'Check complete!' as status; 