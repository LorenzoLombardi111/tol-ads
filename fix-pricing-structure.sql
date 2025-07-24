-- Fix Pricing Structure (Corrected Version)
-- Run this in your Supabase SQL Editor

-- 1. First, let's see what plans currently exist
SELECT 'Current plans:' as info;
SELECT name, credits_included, price_cents, is_active FROM payment_plans ORDER BY name;

-- 2. Update existing plans with new pricing (1 credit = $1)
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

-- 3. Check if Ultra Pack already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM payment_plans WHERE name = 'Ultra Pack') THEN
    -- Insert the new Ultra Pack
    INSERT INTO payment_plans (name, credits_included, price_cents, is_active, sort_order)
    VALUES ('Ultra Pack', 1000, 90000, true, 4);  -- $900.00 (10% discount from $1000)
  ELSE
    -- Update existing Ultra Pack
    UPDATE payment_plans 
    SET 
      credits_included = 1000,
      price_cents = 90000,
      is_active = true,
      sort_order = 4
    WHERE name = 'Ultra Pack';
  END IF;
END $$;

-- 4. Ensure all plans are active and properly ordered
UPDATE payment_plans SET is_active = true WHERE name IN ('Starter Pack', 'Pro Pack', 'Enterprise Pack', 'Ultra Pack');

-- 5. Verify the updated pricing
SELECT 'Updated pricing structure:' as info;
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

-- 6. Show summary
SELECT 'Pricing structure updated successfully!' as status; 