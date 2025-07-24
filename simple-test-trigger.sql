-- Simple Test Trigger
-- Run this in your Supabase SQL Editor

-- 1. Check current state
SELECT 'Current credits count:' as info, COUNT(*) as count FROM user_credits;

-- 2. Check if trigger exists
SELECT 'Trigger exists:' as info, 
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.triggers 
           WHERE trigger_name = 'trigger_create_user_credits'
       ) THEN 'YES' ELSE 'NO' END as status;

-- 3. Check if function exists
SELECT 'Function exists:' as info,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.routines 
           WHERE routine_name = 'create_user_credits'
       ) THEN 'YES' ELSE 'NO' END as status;

-- 4. Show recent credits
SELECT 'Recent credits:' as info, user_id, credits_available, created_at 
FROM user_credits 
ORDER BY created_at DESC 
LIMIT 3;

-- 5. Show users without credits
SELECT 'Users without credits:' as info, COUNT(*) as count 
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_credits);

-- 6. Test by creating credits for existing users
INSERT INTO user_credits (user_id, credits_available, credits_used)
SELECT id, 2, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_credits)
ON CONFLICT (user_id) DO NOTHING;

-- 7. Check final state
SELECT 'Final credits count:' as info, COUNT(*) as count FROM user_credits; 