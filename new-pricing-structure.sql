-- New Pricing Structure
-- Run this in your Supabase SQL Editor

-- 1. First, let's see what plans currently exist
SELECT 'Current plans before update:' as info;
SELECT name, credits_included, price_cents, is_active FROM payment_plans ORDER BY name;

-- 2. Clear all existing plans
DELETE FROM payment_plans;

-- 3. Insert the new pricing structure
INSERT INTO payment_plans (name, credits_included, price_cents, is_active, sort_order) VALUES
('Starter Pack', 10, 1000, true, 1),           -- $10.00 (no discount)
('Booster Pack', 50, 5000, true, 2),           -- $50.00 (no discount)
('Pro Pack', 100, 9500, true, 3),              -- $95.00 (5% discount from $100)
('Elite Pack', 500, 46200, true, 4),           -- $462.00 (7.5% discount from $500)
('Enterprise Pack', 1000, 90000, true, 5);     -- $900.00 (10% discount from $1000)

-- 4. Verify the new pricing structure
SELECT 'New pricing structure:' as info;
SELECT 
  name,
  credits_included,
  price_cents,
  ROUND(price_cents / 100.0, 2) as price_dollars,
  ROUND((price_cents / 100.0) / credits_included, 3) as price_per_credit,
  CASE 
    WHEN name = 'Starter Pack' THEN 'No discount'
    WHEN name = 'Booster Pack' THEN 'No discount'
    WHEN name = 'Pro Pack' THEN '5% discount'
    WHEN name = 'Elite Pack' THEN '7.5% discount'
    WHEN name = 'Enterprise Pack' THEN '10% discount'
  END as discount_info,
  CASE 
    WHEN name = 'Starter Pack' THEN 'No savings'
    WHEN name = 'Booster Pack' THEN 'No savings'
    WHEN name = 'Pro Pack' THEN 'Save $5.00'
    WHEN name = 'Elite Pack' THEN 'Save $38.00'
    WHEN name = 'Enterprise Pack' THEN 'Save $100.00'
  END as savings_amount,
  sort_order
FROM payment_plans 
WHERE is_active = true
ORDER BY sort_order;

-- 5. Show summary
SELECT 'New pricing structure created successfully!' as status; 