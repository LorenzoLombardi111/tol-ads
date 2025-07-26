-- Manual Credit Addition Script
-- Use this to add credits for payments that went through but weren't added automatically

-- First, find your user ID (replace 'your-email@example.com' with your actual email)
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then add credits (replace 'your-user-id-here' with the ID from above)
-- Replace 100 with the number of credits you purchased
SELECT update_user_credits(
  'your-user-id-here',  -- Replace with your actual user ID
  100,                   -- Replace with the number of credits you purchased
  'purchase',
  'Manual credit addition for Stripe payment that went through',
  NULL
);

-- Verify the credits were added
SELECT 
  user_id,
  credits_available,
  credits_used,
  updated_at
FROM user_credits 
WHERE user_id = 'your-user-id-here';  -- Replace with your actual user ID 