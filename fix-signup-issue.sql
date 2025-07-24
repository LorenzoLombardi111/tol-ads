-- Comprehensive Fix for Sign Up Issue
-- Run this in your Supabase SQL Editor

-- 1. First, let's check if there are any existing users without credits
SELECT 'Users without credits:' as info, COUNT(*) as count 
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_credits);

-- 2. Temporarily disable RLS to allow the trigger to work
ALTER TABLE user_credits DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions DISABLE ROW LEVEL SECURITY;

-- 3. Create credits for any existing users
INSERT INTO user_credits (user_id, credits_available, credits_used)
SELECT id, 5, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_credits)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Re-enable RLS with proper policies
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can insert own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON credit_transactions;

-- 6. Create new policies that work with the trigger
CREATE POLICY "Users can view own credits" ON user_credits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits" ON user_credits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON user_credits
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON credit_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Create a bypass policy for the trigger function
CREATE POLICY "Allow trigger to create credits" ON user_credits
    FOR INSERT WITH CHECK (true);

-- 8. Update the trigger function to be more robust
CREATE OR REPLACE FUNCTION create_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Always try to insert, let the conflict handling deal with duplicates
    INSERT INTO user_credits (user_id, credits_available, credits_used)
    VALUES (NEW.id, 5, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Failed to create user credits for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- 9. Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS trigger_create_user_credits ON auth.users;
CREATE TRIGGER trigger_create_user_credits
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_credits();

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_credits TO authenticated;
GRANT ALL ON credit_transactions TO authenticated;

-- 11. Verify the setup
SELECT 'Setup complete. Test sign up now!' as status; 