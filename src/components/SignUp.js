import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import Logo from '../Logo';
import './SignUp.css';

const SignUp = ({ onSignUpSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Check if Supabase is properly configured
    if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
      setError('Application configuration error. Please contact support.');
      console.error('Missing Supabase environment variables');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        throw error;
      }

      if (data.user && !data.user.email_confirmed_at) {
        // Create credits for the new user (secure server-side approach)
        try {
          const { error: creditError } = await supabase
            .from('user_credits')
            .insert([
              {
                user_id: data.user.id,
                credits_available: 2,
                credits_used: 0
              }
            ])
            .single();

          if (creditError && !creditError.message.includes('duplicate key')) {
            console.error('Credit creation error:', creditError);
          }
        } catch (creditError) {
          console.log('Credit creation failed (might already exist):', creditError);
        }
        
        setSuccess('Please check your email to confirm your account!');
        // Optionally redirect to login after a delay
        setTimeout(() => {
          if (onSignUpSuccess) {
            onSignUpSuccess();
          }
        }, 3000);
      } else {
        // Create credits for the new user (secure server-side approach)
        try {
          const { error: creditError } = await supabase
            .from('user_credits')
            .insert([
              {
                user_id: data.user.id,
                credits_available: 2,
                credits_used: 0
              }
            ])
            .single();

          if (creditError && !creditError.message.includes('duplicate key')) {
            console.error('Credit creation error:', creditError);
          }
        } catch (creditError) {
          console.log('Credit creation failed (might already exist):', creditError);
        }
        
        setSuccess('Account created successfully!');
        if (onSignUpSuccess) {
          onSignUpSuccess();
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      
      // Provide more specific error messages
      if (error.message.includes('Invalid API key')) {
        setError('Configuration error. Please contact support.');
      } else if (error.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <Logo size="medium" showText={true} />
          <h2>Create Your Account</h2>
          <p>Start creating amazing ads today</p>
        </div>

        <form onSubmit={handleSignUp} className="signup-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="signup-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="signup-footer">
          <p>Already have an account? <a href="/login">Log in</a></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 