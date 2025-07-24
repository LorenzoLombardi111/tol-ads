-- Delete Pro Pack
-- Run this in your Supabase SQL Editor

-- 1. First, let's see what plans currently exist
SELECT 'Current plans before deletion:' as info;
SELECT name, credits_included, price_cents, is_active FROM payment_plans ORDER BY name;

-- 2. Delete the Pro Pack
DELETE FROM payment_plans WHERE name = 'Pro Pack';

-- 3. Reorder the remaining plans
UPDATE payment_plans SET sort_order = 1 WHERE name = 'Starter Pack';
UPDATE payment_plans SET sort_order = 2 WHERE name = 'Enterprise Pack';
UPDATE payment_plans SET sort_order = 3 WHERE name = 'Ultra Pack';

-- 4. Verify the deletion and updated order
SELECT 'Plans after deletion:' as info;
SELECT 
  name,
  credits_included,
  price_cents,
  ROUND(price_cents / 100.0, 2) as price_dollars,
  ROUND((price_cents / 100.0) / credits_included, 3) as price_per_credit,
  CASE 
    WHEN name = 'Starter Pack' THEN 'No discount'
    WHEN name = 'Enterprise Pack' THEN '7.5% discount'
    WHEN name = 'Ultra Pack' THEN '10% discount'
  END as discount_info,
  sort_order
FROM payment_plans 
WHERE is_active = true
ORDER BY sort_order;

-- 5. Show summary
SELECT 'Pro Pack deleted successfully!' as status; 