-- Test Trigger by Creating a Test User
-- Run this in your Supabase SQL Editor

-- 1. Check current state
SELECT 'Current credits count:' as info, COUNT(*) as count FROM user_credits;

-- 2. Create a test user (this should trigger the credit creation)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_by,
    updated_by,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at
) VALUES (
    gen_random_uuid(),
    'test-' || extract(epoch from now()) || '@example.com',
    crypt('testpassword', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    now(),
    '',
    now(),
    '',
    '',
    now(),
    now(),
    '{}',
    '{}',
    false,
    null,
    null,
    '',
    now(),
    '',
    '',
    now(),
    '',
    0,
    null,
    '',
    now()
);

-- 3. Check if credits were created
SELECT 'Credits after test user creation:' as info, COUNT(*) as count FROM user_credits;

-- 4. Show the latest credit record
SELECT 'Latest credit record:' as info, user_id, credits_available, created_at 
FROM user_credits 
ORDER BY created_at DESC 
LIMIT 1;

-- 5. Clean up test user (optional)
-- Uncomment the line below if you want to remove the test user
-- DELETE FROM auth.users WHERE email LIKE 'test-%@example.com'; 