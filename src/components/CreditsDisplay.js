import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './CreditsDisplay.css';

const CreditsDisplay = ({ userId, onCreditsUpdate }) => {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUserCredits();
    }
  }, [userId]);

  const fetchUserCredits = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_credits')
        .select('credits_available')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const creditAmount = data?.credits_available || 0;
      setCredits(creditAmount);
      
      if (onCreditsUpdate) {
        onCreditsUpdate(creditAmount);
      }
    } catch (err) {
      console.error('Error fetching credits:', err);
      setError('Failed to load credits');
    } finally {
      setLoading(false);
    }
  };

  // Refresh credits when called from parent
  React.useImperativeHandle(onCreditsUpdate, () => ({
    refresh: fetchUserCredits
  }));

  if (loading) {
    return (
      <div className="credits-display loading">
        <div className="credits-spinner">⟳</div>
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="credits-display error">
        <span>{error}</span>
        <button onClick={fetchUserCredits}>Retry</button>
      </div>
    );
  }

  return (
    <div className="credits-display">
      <div className="credits-icon">💎</div>
      <div className="credits-info">
        <span className="credits-count">{credits}</span>
        <span className="credits-label">Credits</span>
      </div>
      {credits < 5 && (
        <div className="low-credits-warning">
          Running low on credits!
        </div>
      )}
    </div>
  );
};

export default CreditsDisplay; 