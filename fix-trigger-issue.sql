-- Fix Trigger Issue for New User Credits
-- Run this in your Supabase SQL Editor

-- 1. First, let's see what's wrong
SELECT 'Diagnosing trigger issues...' as status;

-- 2. Drop and recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION create_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Log the attempt
    RAISE NOTICE 'Creating credits for user: %', NEW.id;
    
    -- Insert credits for the new user
    INSERT INTO user_credits (user_id, credits_available, credits_used)
    VALUES (NEW.id, 2, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Credits created successfully for user: %', NEW.id;
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Failed to create user credits for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- 3. Drop and recreate the trigger
DROP TRIGGER IF EXISTS trigger_create_user_credits ON auth.users;

CREATE TRIGGER trigger_create_user_credits
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_credits();

-- 4. Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_user_credits() TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_credits() TO service_role;

-- 5. Ensure RLS allows the trigger to work
-- Create a policy that allows the trigger to insert credits
DROP POLICY IF EXISTS "Allow trigger to create credits" ON user_credits;
CREATE POLICY "Allow trigger to create credits" ON user_credits
    FOR INSERT WITH CHECK (true);

-- 6. Create credits for any existing users who don't have them
INSERT INTO user_credits (user_id, credits_available, credits_used)
SELECT id, 2, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_credits)
ON CONFLICT (user_id) DO NOTHING;

-- 7. Verify the setup
SELECT 'Trigger fixed! New users will get 2 credits.' as status; 