-- Fix Ad History Table for Status Updates
-- Run this in your Supabase SQL Editor

-- 1. Create ad_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS ad_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_image_url TEXT NOT NULL,
    inspiration_image_url TEXT NOT NULL,
    email_sent_to TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    generated_ads JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add generated_ads column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'ad_history' AND column_name = 'generated_ads') THEN
        ALTER TABLE ad_history ADD COLUMN generated_ads JSONB;
    END IF;
    
    -- Add error_message column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'ad_history' AND column_name = 'error_message') THEN
        ALTER TABLE ad_history ADD COLUMN error_message TEXT;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'ad_history' AND column_name = 'updated_at') THEN
        ALTER TABLE ad_history ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 3. Set up RLS policies
ALTER TABLE ad_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own ad history" ON ad_history;
DROP POLICY IF EXISTS "Users can insert own ad history" ON ad_history;
DROP POLICY IF EXISTS "Users can update own ad history" ON ad_history;

-- Create new policies
CREATE POLICY "Users can view own ad history" ON ad_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ad history" ON ad_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ad history" ON ad_history
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. Grant permissions
GRANT ALL ON ad_history TO authenticated;
GRANT ALL ON ad_history TO service_role;

-- 5. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_ad_history_user_id ON ad_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_history_status ON ad_history(status);
CREATE INDEX IF NOT EXISTS idx_ad_history_created_at ON ad_history(created_at);

-- 6. Verify the setup
SELECT 'Ad history table is ready for status updates!' as status; 