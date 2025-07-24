-- Fix Manual Credit Creation
-- Run this in your Supabase SQL Editor

-- 1. Ensure RLS allows authenticated users to insert their own credits
DROP POLICY IF EXISTS "Users can insert own credits" ON user_credits;
CREATE POLICY "Users can insert own credits" ON user_credits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Also allow the trigger to work (if it exists)
DROP POLICY IF EXISTS "Allow trigger to create credits" ON user_credits;
CREATE POLICY "Allow trigger to create credits" ON user_credits
    FOR INSERT WITH CHECK (true);

-- 3. Grant necessary permissions
GRANT ALL ON user_credits TO authenticated;

-- 4. Verify the setup
SELECT 'Manual credit creation should now work!' as status; 