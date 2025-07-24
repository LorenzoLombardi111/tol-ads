-- Add Product Description and Size Fields to Ad History
-- Run this in your Supabase SQL Editor

-- 1. Add product_description column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'ad_history' AND column_name = 'product_description') THEN
        ALTER TABLE ad_history ADD COLUMN product_description TEXT;
    END IF;
END $$;

-- 2. Add product_size column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'ad_history' AND column_name = 'product_size') THEN
        ALTER TABLE ad_history ADD COLUMN product_size VARCHAR(50);
    END IF;
END $$;

-- 3. Verify the columns were added
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ad_history' 
AND column_name IN ('product_description', 'product_size')
ORDER BY column_name;

-- 4. Show the updated table structure
SELECT 'Ad history table updated with product fields!' as status; 