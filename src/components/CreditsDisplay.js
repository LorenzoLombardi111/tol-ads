import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './CreditsDisplay.css';

const CreditsDisplay = ({ userId }) => {
  const [creditAmount, setCreditAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUserCredits = async (userId) => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits_available')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching credits:', error);
        setCreditAmount(0);
      } else {
        setCreditAmount(data?.credits_available || 0);
      }
    } catch (err) {
      console.error('Error fetching credits:', err);
      setCreditAmount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCredits(userId);
  }, [userId]);

  return (
    <div className="credits-display">
      {loading ? (
        <span>Loading credits...</span>
      ) : (
        <span>{creditAmount} credits available</span>
      )}
    </div>
  );
};

export default CreditsDisplay; 