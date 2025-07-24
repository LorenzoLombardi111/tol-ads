-- Simple Trigger Fix
-- Run this in your Supabase SQL Editor

-- 1. Drop old trigger and function
DROP TRIGGER IF EXISTS trigger_create_user_credits ON auth.users;
DROP FUNCTION IF EXISTS create_user_credits();

-- 2. Create simple function
CREATE OR REPLACE FUNCTION create_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO user_credits (user_id, credits_available, credits_used)
    VALUES (NEW.id, 2, 0)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NEW;
END;
$$;

-- 3. Create trigger
CREATE TRIGGER trigger_create_user_credits
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_credits();

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION create_user_credits() TO service_role;

-- 5. Create credits for existing users
INSERT INTO user_credits (user_id, credits_available, credits_used)
SELECT id, 2, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_credits)
ON CONFLICT (user_id) DO NOTHING;

-- 6. Done
SELECT 'Trigger fixed!' as status; 