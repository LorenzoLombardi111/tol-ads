-- Supabase Database Setup for Credit System
-- Run this in your Supabase SQL Editor

-- 1. Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    credits_available INTEGER DEFAULT 0 NOT NULL,
    credits_used INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'usage', 'admin_grant', 'refund'
    credit_change INTEGER NOT NULL, -- positive for credits added, negative for credits used
    description TEXT,
    admin_id UUID REFERENCES auth.users(id), -- for admin-granted credits
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create payment_plans table
CREATE TABLE IF NOT EXISTS payment_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    credits_included INTEGER NOT NULL,
    price_cents INTEGER NOT NULL, -- price in cents (e.g., 999 = $9.99)
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create user_roles table for admin functionality
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'user', 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 5. Create function to update user credits
CREATE OR REPLACE FUNCTION update_user_credits(
    target_user_id UUID,
    credit_change INTEGER,
    transaction_type VARCHAR(50),
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

-- 6. Create trigger to automatically create user_credits record for new users
CREATE OR REPLACE FUNCTION create_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO user_credits (user_id, credits_available, credits_used)
    VALUES (NEW.id, 0, 0);
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_create_user_credits
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_credits();

-- 7. Insert sample payment plans
INSERT INTO payment_plans (name, description, credits_included, price_cents, sort_order) VALUES
('Starter Pack', 'Perfect for trying out our service', 10, 999, 1),
('Popular Pack', 'Most popular choice for regular users', 50, 3999, 2),
('Pro Pack', 'Best value for power users', 150, 9999, 3),
('Enterprise Pack', 'For businesses and high-volume users', 500, 29999, 4)
ON CONFLICT DO NOTHING;

-- 8. Create RLS (Row Level Security) policies
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- User can only see their own credits
CREATE POLICY "Users can view own credits" ON user_credits
    FOR SELECT USING (auth.uid() = user_id);

-- User can only see their own transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Anyone can view active payment plans
CREATE POLICY "Anyone can view active payment plans" ON payment_plans
    FOR SELECT USING (is_active = true);

-- Only admins can view user roles
CREATE POLICY "Admins can view user roles" ON user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 9. Grant initial credits to existing users (optional)
-- Uncomment and run this if you want to give existing users some free credits
/*
INSERT INTO user_credits (user_id, credits_available, credits_used)
SELECT id, 5, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_credits)
ON CONFLICT (user_id) DO NOTHING;
*/ 