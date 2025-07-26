import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import CreditsDisplay from './components/CreditsDisplay';
import PurchaseCredits from './components/PurchaseCredits';
import './Dashboard.css';

const Dashboard = ({ userId, showPurchaseModal, setShowPurchaseModal }) => {
  const [adHistory, setAdHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdHistory = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('ad_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setAdHistory(data || []);
      } catch (err) {
        console.error('Error fetching ad history:', err);
        setError('Failed to load ad history');
      } finally {
        setLoading(false);
      }
    };

    fetchAdHistory();
  }, [userId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'processing':
        return 'status-processing';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePurchaseClick = () => {
    setShowPurchaseModal(true);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Your Dashboard</h2>
        <div className="dashboard-actions">
          <CreditsDisplay userId={userId} />
          <button 
            onClick={handlePurchaseClick}
            className="purchase-credits-btn"
          >
            Buy More Credits
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="ad-history-section">
          <h3>Recent Ad Generations</h3>
          
          {loading ? (
            <div className="loading-message">Loading your ad history...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : adHistory.length === 0 ? (
            <div className="empty-state">
              <p>No ads generated yet. Start creating your first ad!</p>
            </div>
          ) : (
            <div className="ad-history-list">
              {adHistory.map((ad) => (
                <div key={ad.id} className="ad-history-item">
                  <div className="ad-info">
                    <div className="ad-description">
                      <strong>Description:</strong> {ad.product_description}
                    </div>
                    <div className="ad-size">
                      <strong>Size:</strong> {ad.product_size}
                    </div>
                    <div className="ad-date">
                      <strong>Created:</strong> {formatDate(ad.created_at)}
                    </div>
                  </div>
                  <div className={`ad-status ${getStatusColor(ad.status)}`}>
                    {ad.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showPurchaseModal && (
        <PurchaseCredits
          userId={userId}
          onPurchaseSuccess={() => setShowPurchaseModal(false)}
          onClose={() => setShowPurchaseModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
