const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { targetUserId, creditsAmount, reason, adminUserId } = req.body;

  // Validate required fields
  if (!targetUserId || !creditsAmount || !adminUserId) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['targetUserId', 'creditsAmount', 'adminUserId']
    });
  }

  // Validate credits amount is a positive number
  if (!Number.isInteger(creditsAmount) || creditsAmount <= 0) {
    return res.status(400).json({ 
      error: 'Credits amount must be a positive integer' 
    });
  }

  try {
    console.log(`👑 Admin ${adminUserId} attempting to grant ${creditsAmount} credits to ${targetUserId}`);

    // Verify admin status
    const { data: adminRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', adminUserId)
      .single();

    if (roleError) {
      console.error('❌ Error checking admin role:', roleError);
      return res.status(500).json({ error: 'Failed to verify admin status' });
    }

    if (!adminRole || adminRole.role !== 'admin') {
      console.log(`❌ Access denied for user ${adminUserId} - Role: ${adminRole?.role}`);
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    console.log('✅ Admin status verified');

    // Grant credits using the database function
    const { data, error } = await supabase.rpc('update_user_credits', {
      target_user_id: targetUserId,
      credit_change: parseInt(creditsAmount),
      transaction_type: 'admin_grant',
      description: reason || `Admin granted ${creditsAmount} credits`,
      admin_id: adminUserId
    });

    if (error) {
      console.error('❌ Error granting credits:', error);
      throw error;
    }

    // Get the updated credit balance for confirmation
    const { data: updatedCredits, error: balanceError } = await supabase
      .from('user_credits')
      .select('credits_available, credits_used')
      .eq('user_id', targetUserId)
      .single();

    if (balanceError) {
      console.warn('⚠️ Could not fetch updated balance:', balanceError);
    }

    console.log(`✅ Successfully granted ${creditsAmount} credits to user ${targetUserId}`);

    res.status(200).json({ 
      success: true, 
      message: `Successfully granted ${creditsAmount} credits`,
      grantedCredits: creditsAmount,
      newBalance: updatedCredits?.credits_available || 'Unknown',
      totalUsed: updatedCredits?.credits_used || 'Unknown'
    });

  } catch (error) {
    console.error('❌ Error in grant-credits API:', error);
    res.status(500).json({ 
      error: 'Failed to grant credits',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
} 