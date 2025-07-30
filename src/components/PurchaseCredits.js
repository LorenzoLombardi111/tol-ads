import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../supabaseClient';
import './PurchaseCredits.css';

const PurchaseCredits = ({ userId, onPurchaseSuccess, onClose }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      
      // Remove duplicates
      const uniquePlans = data ? data.reduce((acc, plan) => {
        const existingPlan = acc.find(p => p.name === plan.name);
        if (!existingPlan) {
          acc.push(plan);
        }
        return acc;
      }, []) : [];
      
      setPlans(uniquePlans);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to load payment plans. Please refresh the page.');
    }
  };

  const handlePurchase = async (plan) => {
    console.log('🔍 Starting purchase for plan:', plan);
    setLoading(true);
    setSelectedPlan(plan.id);
    setError('');
    
    try {
      console.log('🔍 Making API call to /api/create-checkout-session');
      console.log('🔍 Request body:', { planId: plan.id, userId: userId });
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          userId: userId,
        }),
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', response.headers);

      const data = await response.json();
      console.log('🔍 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Request failed`);
      }

      if (!data.sessionId) {
        throw new Error('No session ID received');
      }
      
      console.log('🔍 Loading Stripe with key:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      console.log('🔍 Redirecting to Stripe checkout with sessionId:', data.sessionId);
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        throw stripeError;
      }
    } catch (err) {
      console.error('❌ Purchase error:', err);
      setError(err.message || 'Purchase failed. Please try again.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="purchase-credits-modal">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Purchase Credits</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <p>Choose a credit package to continue creating ads:</p>
          
          <div className="plans-grid">
            {plans.map((plan) => (
              <div key={plan.id} className={`plan-card ${plan.name === 'Pro Pack' ? 'popular' : ''}`}>
                <div className="plan-header">
                  <h4>{plan.name}</h4>
                  {plan.name === 'Pro Pack' && (
                    <div className="popular-badge">Most Popular</div>
                  )}
                </div>
                
                <div className="plan-body">
                  <div className="credits-amount">
                    {plan.credits_included} <span>Credits</span>
                  </div>
                  
                  <div className="price">
                    ${(plan.price_cents / 100).toFixed(2)}
                  </div>
                  
                  <div className="price-per-credit">
                    ${((plan.price_cents / 100) / plan.credits_included).toFixed(3)} per credit
                  </div>
                  
                  {plan.name === 'Pro Pack' && (
                    <div className="discount-badge">
                      <span className="discount-text">5% OFF</span>
                      <span className="savings-text">Save $5.00</span>
                    </div>
                  )}
                  
                  {plan.name === 'Elite Pack' && (
                    <div className="discount-badge">
                      <span className="discount-text">7.5% OFF</span>
                      <span className="savings-text">Save $38.00</span>
                    </div>
                  )}
                  
                  {plan.name === 'Enterprise Pack' && (
                    <div className="discount-badge">
                      <span className="discount-text">10% OFF</span>
                      <span className="savings-text">Save $100.00</span>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => handlePurchase(plan)}
                  disabled={loading}
                  className={`purchase-btn ${selectedPlan === plan.id ? 'loading' : ''}`}
                >
                  {loading && selectedPlan === plan.id ? (
                    <>
                      <span className="spinner">⟳</span>
                      Processing...
                    </>
                  ) : (
                    'Purchase'
                  )}
                </button>
              </div>
            ))}
          </div>
          
          {plans.length === 0 && !error && (
            <div className="no-plans-message">
              No payment plans available. Please contact support.
            </div>
          )}
          
          <div className="secure-payment">
            <div className="secure-icon">🔒</div>
            <span>Secure payment powered by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseCredits; 