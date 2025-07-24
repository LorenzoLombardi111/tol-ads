-- Secure Automatic Credit Assignment for New Users
-- Run this in your Supabase SQL Editor

-- 1. Create a secure trigger function that automatically gives 2 credits
CREATE OR REPLACE FUNCTION create_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Automatically insert 2 credits for new users
    INSERT INTO user_credits (user_id, credits_available, credits_used)
    VALUES (NEW.id, 2, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail user creation
        RAISE WARNING 'Failed to create credits for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- 2. Create the trigger on auth.users table
DROP TRIGGER IF EXISTS trigger_create_user_credits ON auth.users;
CREATE TRIGGER trigger_create_user_credits
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_credits();

-- 3. Set up proper RLS policies
-- Allow users to view their own credits
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
CREATE POLICY "Users can view own credits" ON user_credits
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own credits (for usage)
DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;
CREATE POLICY "Users can update own credits" ON user_credits
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow the trigger to insert credits (SECURITY DEFINER function)
DROP POLICY IF EXISTS "Allow trigger to create credits" ON user_credits;
CREATE POLICY "Allow trigger to create credits" ON user_credits
    FOR INSERT WITH CHECK (true);

-- 4. Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_user_credits() TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON user_credits TO authenticated;

-- 5. Create credits for any existing users who don't have them
INSERT INTO user_credits (user_id, credits_available, credits_used)
SELECT id, 2, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_credits)
ON CONFLICT (user_id) DO NOTHING;

-- 6. Verify the setup
SELECT 'Secure automatic credit assignment is now active!' as status; 