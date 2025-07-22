-- Fix Payment Plans and Function Issues
-- Run this in your Supabase SQL Editor

-- 1. Drop the duplicate function
DROP FUNCTION IF EXISTS update_user_credits(target_user_id uuid, credit_change integer, transaction_type character varying, description text, admin_id uuid);
DROP FUNCTION IF EXISTS update_user_credits(target_user_id uuid, credit_change integer, transaction_type text, description text, admin_id uuid);

-- 2. Clear existing payment plans and add fresh ones
DELETE FROM payment_plans;

-- 3. Insert fresh payment plans
INSERT INTO payment_plans (name, description, credits_included, price_cents, sort_order) VALUES
('Starter Pack', 'Perfect for trying out our service', 10, 999, 1),
('Popular Pack', 'Most popular choice for regular users', 50, 3999, 2),
('Pro Pack', 'Best value for power users', 150, 9999, 3),
('Enterprise Pack', 'For businesses and high-volume users', 500, 29999, 4);

-- 4. Recreate the function with correct parameter types
CREATE OR REPLACE FUNCTION update_user_credits(
    target_user_id UUID,
    credit_change INTEGER,
    transaction_type TEXT,
    description TEXT DEFAULT NULL,
    admin_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_credits RECORD;
    new_credits_available INTEGER;
    transaction_id UUID;
BEGIN
    -- Get current credits
    SELECT credits_available, credits_used INTO current_credits
    FROM user_credits
    WHERE user_id = target_user_id;
    
    -- If no record exists, create one
    IF current_credits IS NULL THEN
        INSERT INTO user_credits (user_id, credits_available, credits_used)
        VALUES (target_user_id, 0, 0);
        current_credits.credits_available := 0;
        current_credits.credits_used := 0;
    END IF;
    
    -- Calculate new credits
    new_credits_available := current_credits.credits_available + credit_change;
    
    -- Validate credits don't go negative (except for admin grants)
    IF new_credits_available < 0 AND transaction_type != 'admin_grant' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Insufficient credits'
        );
    END IF;
    
    -- Update user credits
    UPDATE user_credits
    SET 
        credits_available = new_credits_available,
        credits_used = CASE 
            WHEN credit_change < 0 THEN current_credits.credits_used + ABS(credit_change)
            ELSE current_credits.credits_used
        END,
        updated_at = NOW()
    WHERE user_id = target_user_id;
    
    -- Create transaction record
    INSERT INTO credit_transactions (
        user_id, 
        transaction_type, 
        credit_change, 
        description, 
        admin_id
    ) VALUES (
        target_user_id,
        transaction_type,
        credit_change,
        description,
        admin_id
    ) RETURNING id INTO transaction_id;
    
    -- Return success with updated credits
    RETURN json_build_object(
        'success', true,
        'transaction_id', transaction_id,
        'new_credits_available', new_credits_available,
        'credit_change', credit_change
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$; 