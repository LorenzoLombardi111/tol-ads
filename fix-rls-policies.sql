-- Fix RLS Policies for User Sign Up
-- Run this in your Supabase SQL Editor

-- 1. Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;

-- 2. Create proper RLS policies for user_credits table
CREATE POLICY "Users can view own credits" ON user_credits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits" ON user_credits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON user_credits
    FOR UPDATE USING (auth.uid() = user_id);

-- 3. Create proper RLS policies for credit_transactions table
CREATE POLICY "Users can view own transactions" ON credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON credit_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Ensure the trigger function has proper permissions
-- This is crucial for the automatic creation of user_credits records
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_credits TO authenticated;
GRANT ALL ON credit_transactions TO authenticated;

-- 5. Recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION create_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user_credits record already exists
    IF NOT EXISTS (SELECT 1 FROM user_credits WHERE user_id = NEW.id) THEN
        INSERT INTO user_credits (user_id, credits_available, credits_used)
        VALUES (NEW.id, 0, 0);
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Failed to create user credits for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- 6. Drop and recreate the trigger
DROP TRIGGER IF EXISTS trigger_create_user_credits ON auth.users;
CREATE TRIGGER trigger_create_user_credits
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_credits();

-- 7. Grant initial credits to any existing users without credits
INSERT INTO user_credits (user_id, credits_available, credits_used)
SELECT id, 5, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_credits)
ON CONFLICT (user_id) DO NOTHING; 