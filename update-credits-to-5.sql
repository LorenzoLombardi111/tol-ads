-- Update New User Credits to 5
-- Run this in your Supabase SQL Editor

-- 1. Update the trigger function to give 5 credits instead of 2
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

-- 2. Verify the trigger is still properly set up
DROP TRIGGER IF EXISTS trigger_create_user_credits ON auth.users;
CREATE TRIGGER trigger_create_user_credits
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_credits();

-- 3. Update existing users who have 2 credits to 5 credits (optional)
-- Uncomment the lines below if you want to update existing users
/*
UPDATE user_credits 
SET credits_available = 5 
WHERE credits_available = 2;
*/

-- 4. Verify the change
SELECT 'New users will now receive 5 free credits!' as status; 