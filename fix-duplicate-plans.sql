-- Fix Duplicate Payment Plans
-- Run this in your Supabase SQL Editor

-- 1. First, let's see what we have
SELECT 'Current plans (showing duplicates):' as info;
SELECT id, name, credits_included, price_cents, is_active, sort_order 
FROM payment_plans 
ORDER BY name, id;

-- 2. Remove all existing plans
DELETE FROM payment_plans;

-- 3. Reset the sequence (if using auto-increment)
-- ALTER SEQUENCE payment_plans_id_seq RESTART WITH 1;

-- 4. Insert the correct plans (no duplicates)
INSERT INTO payment_plans (name, credits_included, price_cents, is_active, sort_order) VALUES
('Starter Pack', 10, 1000, true, 1),           -- $10.00
('Booster Pack', 50, 5000, true, 2),           -- $50.00
('Pro Pack', 100, 9500, true, 3),              -- $95.00 (5% discount)
('Elite Pack', 500, 46200, true, 4),           -- $462.00 (7.5% discount)
('Enterprise Pack', 1000, 90000, true, 5);     -- $900.00 (10% discount)

-- 5. Verify the fix
SELECT 'Fixed plans (should be 5 total):' as info;
SELECT id, name, credits_included, price_cents, is_active, sort_order 
FROM payment_plans 
ORDER BY sort_order;

-- 6. Show summary
SELECT 'Duplicate plans fixed!' as status; 