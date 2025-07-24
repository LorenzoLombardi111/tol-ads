-- Force Trigger Fix - Comprehensive Solution
-- Run this in your Supabase SQL Editor

-- 1. First, let's see what's happening
SELECT 'Starting comprehensive trigger fix...' as status;

-- 2. Drop everything and start fresh
DROP TRIGGER IF EXISTS trigger_create_user_credits ON auth.users;
DROP FUNCTION IF EXISTS create_user_credits();

-- 3. Create a bulletproof trigger function
CREATE OR REPLACE FUNCTION create_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    credit_record_id UUID;
BEGIN
    -- Log the attempt
    RAISE LOG 'Creating credits for new user: %', NEW.id;
    
    -- Insert credits with explicit conflict handling
    INSERT INTO user_credits (user_id, credits_available, credits_used)
    VALUES (NEW.id, 2, 0)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id INTO credit_record_id;
    
    -- Log success
    IF credit_record_id IS NOT NULL THEN
        RAISE LOG 'Successfully created credits for user: %', NEW.id;
    ELSE
        RAISE LOG 'Credits already existed for user: %', NEW.id;
    END IF;
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail user creation
        RAISE WARNING 'Failed to create credits for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- 4. Create the trigger with explicit schema
CREATE TRIGGER trigger_create_user_credits
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_credits();

-- 5. Grant all necessary permissions
GRANT EXECUTE ON FUNCTION create_user_credits() TO service_role;
GRANT EXECUTE ON FUNCTION create_user_credits() TO postgres;
GRANT EXECUTE ON FUNCTION create_user_credits() TO authenticated;

-- 6. Ensure RLS is properly configured
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;
DROP POLICY IF EXISTS "Allow trigger to create credits" ON user_credits;
DROP POLICY IF EXISTS "Users can insert own credits" ON user_credits;

-- Create new policies
CREATE POLICY "Users can view own credits" ON user_credits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON user_credits
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow trigger to create credits" ON user_credits
    FOR INSERT WITH CHECK (true);

-- 7. Grant table permissions
GRANT ALL ON user_credits TO authenticated;
GRANT ALL ON user_credits TO service_role;

-- 8. Create credits for any existing users who don't have them
INSERT INTO user_credits (user_id, credits_available, credits_used)
SELECT id, 2, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_credits)
ON CONFLICT (user_id) DO NOTHING;

-- 9. Verify the setup
SELECT 'Trigger fix completed! New users will get 2 credits.' as status; 