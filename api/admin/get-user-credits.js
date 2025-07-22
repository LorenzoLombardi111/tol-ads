const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { adminUserId, targetUserId, page = 1, limit = 50 } = req.query;

  if (!adminUserId) {
    return res.status(400).json({ error: 'Admin user ID required' });
  }

  try {
    console.log(`👑 Admin ${adminUserId} requesting credit data for ${targetUserId || 'all users'}`);

    // Verify admin status
    const { data: adminRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', adminUserId)
      .single();

    if (roleError || adminRole?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    if (targetUserId) {
      // Get specific user's data
      const [creditsResult, transactionsResult, userInfo] = await Promise.all([
        supabase
          .from('user_credits')
          .select('*')
          .eq('user_id', targetUserId)
          .single(),
        
        supabase
          .from('credit_transactions')
          .select('*')
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false })
          .limit(parseInt(limit))
          .range((parseInt(page) - 1) * parseInt(limit), parseInt(page) * parseInt(limit) - 1),
        
        supabase.auth.admin.getUserById(targetUserId)
      ]);

      res.status(200).json({
        user: {
          id: targetUserId,
          email: userInfo.data.user?.email || 'Unknown',
          credits: creditsResult.data || { credits_available: 0, credits_used: 0 },
          transactions: transactionsResult.data || []
        }
      });

    } else {
      // Get all users' credit data (paginated)
      const { data: allCredits, error } = await supabase
        .from('user_credits')
        .select(`
          *,
          user_roles!left (role)
        `)
        .order('updated_at', { ascending: false })
        .range((parseInt(page) - 1) * parseInt(limit), parseInt(page) * parseInt(limit) - 1);

      if (error) throw error;

      // Get user emails for each credit record
      const usersWithEmails = await Promise.all(
        allCredits.map(async (credit) => {
          try {
            const userInfo = await supabase.auth.admin.getUserById(credit.user_id);
            return {
              ...credit,
              email: userInfo.data.user?.email || 'Unknown'
            };
          } catch (err) {
            console.warn(`Could not fetch email for user ${credit.user_id}:`, err.message);
            return {
              ...credit,
              email: 'Unknown'
            };
          }
        })
      );

      res.status(200).json({
        users: usersWithEmails,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    }

  } catch (error) {
    console.error('❌ Error in get-user-credits API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch credit data',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
} 