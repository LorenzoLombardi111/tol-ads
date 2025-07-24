const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Add logging to debug
console.log('Environment variables:', {
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { recordId, status, generatedAds, error } = req.body;

    // Validate required fields
    if (!recordId) {
      return res.status(400).json({ error: 'recordId is required' });
    }

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    // Update the ad history record
    const updateData = {
      status: status,
      updated_at: new Date().toISOString()
    };

    // Add generated ads if provided
    if (generatedAds) {
      updateData.generated_ads = generatedAds;
    }

    // Add error message if provided
    if (error) {
      updateData.error_message = error;
    }

    const { data, error: updateError } = await supabase
      .from('ad_history')
      .update(updateData)
      .eq('id', recordId)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      return res.status(500).json({ 
        error: 'Failed to update ad status',
        details: process.env.NODE_ENV === 'development' ? updateError.message : 'Internal server error'
      });
    }

    console.log(`Ad status updated: ${recordId} -> ${status}`);

    res.status(200).json({ 
      success: true, 
      message: 'Ad status updated successfully',
      record: data
    });

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}; 