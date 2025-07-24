-- Fix Credit Insertion for New Users
-- Run this in your Supabase SQL Editor

-- 1. Ensure RLS allows authenticated users to insert their own credits
DROP POLICY IF EXISTS "Users can insert own credits" ON user_credits;
CREATE POLICY "Users can insert own credits" ON user_credits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Ensure users can view their own credits
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
CREATE POLICY "Users can view own credits" ON user_credits
    FOR SELECT USING (auth.uid() = user_id);

-- 3. Ensure users can update their own credits (for usage)
DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;
CREATE POLICY "Users can update own credits" ON user_credits
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. Grant necessary permissions
GRANT ALL ON user_credits TO authenticated;

-- 5. Create credits for any existing users who don't have them
INSERT INTO user_credits (user_id, credits_available, credits_used)
SELECT id, 2, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_credits)
ON CONFLICT (user_id) DO NOTHING;

-- 6. Verify the setup
SELECT 'Credit insertion should now work!' as status; 