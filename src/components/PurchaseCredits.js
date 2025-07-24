import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../supabaseClient';
import './PurchaseCredits.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PurchaseCredits = ({ userId, onPurchaseSuccess, onClose }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

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
      setPlans(data || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  const handlePurchase = async (plan) => {
    setLoading(true);
    setSelectedPlan(plan.id);
    
    try {
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

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Purchase error:', err);
      alert('Purchase failed. Please try again.');
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
          <p>Choose a credit package to continue creating ads:</p>
          
          <div className="plans-grid">
            {plans.map((plan) => (
              <div key={plan.id} className="plan-card">
                <div className="plan-header">
                  <h4>{plan.name}</h4>
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
                  
                  {/* Discount Information */}
                  {plan.name === 'Enterprise Pack' && (
                    <div className="discount-badge">
                      <span className="discount-text">7.5% OFF</span>
                      <span className="savings-text">Save $7.50</span>
                    </div>
                  )}
                  
                  {plan.name === 'Ultra Pack' && (
                    <div className="discount-badge">
                      <span className="discount-text">10% OFF</span>
                      <span className="savings-text">Save $100</span>
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