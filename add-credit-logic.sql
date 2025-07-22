-- Add Credit Deduction Logic
-- This script adds a function to automatically deduct credits when ads are generated

-- Create a function to handle ad generation with credit deduction
CREATE OR REPLACE FUNCTION generate_ad_with_credit_deduction(
    user_id_param UUID,
    product_image_url_param TEXT,
    inspiration_image_url_param TEXT,
    email_sent_to_param TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_credits RECORD;
    ad_record_id UUID;
    credit_result JSON;
BEGIN
    -- Check if user has enough credits
    SELECT credits_available INTO current_credits
    FROM user_credits
    WHERE user_id = user_id_param;
    
    IF current_credits IS NULL OR current_credits.credits_available < 1 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Insufficient credits. Please purchase more credits.'
        );
    END IF;
    
    -- Deduct 1 credit
    SELECT * INTO credit_result FROM update_user_credits(
        user_id_param,
        -1,
        'usage',
        'Ad generation - 1 credit used'
    );
    
    IF NOT (credit_result->>'success')::boolean THEN
        RETURN json_build_object(
            'success', false,
            'error', credit_result->>'error'
        );
    END IF;
    
    -- Create ad record
    INSERT INTO ad_history (
        user_id,
        product_image_url,
        inspiration_image_url,
        email_sent_to,
        status
    ) VALUES (
        user_id_param,
        product_image_url_param,
        inspiration_image_url_param,
        email_sent_to_param,
        'pending'
    ) RETURNING id INTO ad_record_id;
    
    RETURN json_build_object(
        'success', true,
        'ad_id', ad_record_id,
        'credits_remaining', (credit_result->>'new_credits_available')::integer
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$; 