import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Logo from './Logo';
import './Dashboard.css';

function Dashboard({ userId }) {
  const [ads, setAds] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchAdHistory();
  }, [userId]);

  const fetchAdHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('ad_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAds(data || []);
      setFilteredAds(data || []);
    } catch (err) {
      console.error('Error fetching ad history:', err);
      setError('Failed to load your ad history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...ads];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(ad => 
        ad.email_sent_to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ad => ad.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(ad => 
        new Date(ad.created_at) >= filterDate
      );
    }

    setFilteredAds(filtered);
  }, [searchTerm, statusFilter, dateFilter, ads]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'completed': 'status-badge status-completed',
      'pending': 'status-badge status-pending',
      'failed': 'status-badge status-failed'
    };
    return statusClasses[status] || 'status-badge';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="premium-loading-content">
          <div className="logo-animation">
            <Logo size="medium" />
          </div>
          <div className="loading-text">
            <h3>Loading Your Dashboard</h3>
            <p>Fetching your creative history...</p>
          </div>
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
              <div className="dashboard-header">
          <h2>Your Ad History</h2>
          <button onClick={fetchAdHistory} className="refresh-btn">
            Refresh
          </button>
        </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by email or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last Month</option>
          </select>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <h3>{ads.length}</h3>
          <p>Total Ads Generated</p>
        </div>
        <div className="stat-card">
          <h3>{ads.filter(ad => ad.status === 'completed').length}</h3>
          <p>Completed</p>
        </div>
        <div className="stat-card">
          <h3>{ads.filter(ad => ad.status === 'pending').length}</h3>
          <p>In Progress</p>
        </div>
      </div>

      {filteredAds.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <h3>No ads found</h3>
          <p>
            {ads.length === 0 
              ? "You haven't generated any ads yet. Start creating!" 
              : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div className="ads-grid">
          {filteredAds.map((ad) => (
            <div key={ad.id} className="ad-card">
              <div className="ad-card-header">
                <span className={getStatusBadge(ad.status)}>
                  {ad.status || 'pending'}
                </span>
                <span className="ad-date">
                  {formatDate(ad.created_at)}
                </span>
              </div>

              <div className="ad-images">
                {ad.product_image_url && (
                  <div className="ad-image-container">
                    <img 
                      src={ad.product_image_url} 
                      alt="Product" 
                      className="ad-thumbnail"
                    />
                    <span className="image-label">Product</span>
                  </div>
                )}
                {ad.inspiration_image_url && (
                  <div className="ad-image-container">
                    <img 
                      src={ad.inspiration_image_url} 
                      alt="Inspiration" 
                      className="ad-thumbnail"
                    />
                    <span className="image-label">Inspiration</span>
                  </div>
                )}
              </div>

              <div className="ad-info">
                <p><strong>Sent to:</strong> {ad.email_sent_to || 'N/A'}</p>
                {ad.generated_ad_urls && ad.generated_ad_urls.length > 0 && (
                  <div className="generated-ads-preview">
                    <p><strong>Generated Ads:</strong></p>
                    <div className="generated-thumbnails">
                      {ad.generated_ad_urls.slice(0, 3).map((url, index) => (
                        <img 
                          key={index}
                          src={url} 
                          alt={`Generated ${index + 1}`} 
                          className="generated-thumbnail"
                        />
                      ))}
                      {ad.generated_ad_urls.length > 3 && (
                        <span className="more-count">
                          +{ad.generated_ad_urls.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {ad.status === 'completed' && ad.generated_ad_urls && (
                <button className="view-results-btn">
                  View Results
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard; 