-- Update Pricing Structure
-- Run this in your Supabase SQL Editor

-- 1. Update existing plans with new pricing (1 credit = $1)
UPDATE payment_plans 
SET 
  name = 'Starter Pack',
  credits_included = 10,
  price_cents = 1000,  -- $10.00
  sort_order = 1
WHERE name = 'Basic Pack' OR name = 'Starter Pack';

UPDATE payment_plans 
SET 
  name = 'Pro Pack',
  credits_included = 50,
  price_cents = 4750,  -- $47.50 (5% discount from $50)
  sort_order = 2
WHERE name = 'Pro Pack';

UPDATE payment_plans 
SET 
  name = 'Enterprise Pack',
  credits_included = 100,
  price_cents = 9250,  -- $92.50 (7.5% discount from $100)
  sort_order = 3
WHERE name = 'Enterprise Pack';

-- 2. Insert the new Ultra Pack
INSERT INTO payment_plans (name, credits_included, price_cents, is_active, sort_order)
VALUES ('Ultra Pack', 1000, 90000, true, 4)  -- $900.00 (10% discount from $1000)
ON CONFLICT (name) DO UPDATE SET
  credits_included = EXCLUDED.credits_included,
  price_cents = EXCLUDED.price_cents,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- 3. Ensure all plans are active and properly ordered
UPDATE payment_plans SET is_active = true WHERE name IN ('Starter Pack', 'Pro Pack', 'Enterprise Pack', 'Ultra Pack');

-- 4. Verify the updated pricing
SELECT 
  name,
  credits_included,
  price_cents,
  ROUND(price_cents / 100.0, 2) as price_dollars,
  ROUND((price_cents / 100.0) / credits_included, 3) as price_per_credit,
  CASE 
    WHEN name = 'Starter Pack' THEN 'No discount'
    WHEN name = 'Pro Pack' THEN '5% discount'
    WHEN name = 'Enterprise Pack' THEN '7.5% discount'
    WHEN name = 'Ultra Pack' THEN '10% discount'
  END as discount_info,
  sort_order
FROM payment_plans 
WHERE is_active = true
ORDER BY sort_order;

-- 5. Show summary
SELECT 'Pricing structure updated successfully!' as status; 