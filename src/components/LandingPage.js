import React from 'react';
import Logo from '../Logo';
import './LandingPage.css';

const LandingPage = ({ onSignUp, onLogin, isAuthenticated, onGoToDashboard }) => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <Logo size="medium" showText={true} />
          <div className="nav-buttons">
            {isAuthenticated ? (
              <button onClick={onGoToDashboard} className="nav-btn signup-btn">
                Go to Dashboard
              </button>
            ) : (
              <>
                <button onClick={onLogin} className="nav-btn login-btn">
                  Log In
                </button>
                <button onClick={onSignUp} className="nav-btn signup-btn">
                  Try for Free
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Copy Competitors for $1, 
              <span className="highlight"> Start For Free</span>
            </h1>
            <p className="hero-subtitle">
              Transform your product images into winning ads that outperform your competition. 
              Get professional, conversion-focused ads delivered to your email in minutes.
            </p>
            <div className="hero-cta">
              {isAuthenticated ? (
                <button onClick={onGoToDashboard} className="cta-primary">
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button onClick={onSignUp} className="cta-primary">
                    Start Creating Ads Free
                  </button>
                  <button onClick={onLogin} className="cta-secondary">
                    Already have an account? Log in
                  </button>
                </>
              )}
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">10,000+</span>
                <span className="stat-label">Ads Generated</span>
              </div>
              <div className="stat">
                <span className="stat-number">$1</span>
                <span className="stat-label">Per Ad</span>
              </div>
              <div className="stat">
                <span className="stat-number">5 min</span>
                <span className="stat-label">Delivery Time</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-container">
              <div className="hero-image">
                <div className="image-placeholder">
                  <span>🎯</span>
                  <p>Your Winning Ads</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose TOLcreatives?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Lightning Fast</h3>
              <p>Get professional ads in under 5 minutes. No waiting, no delays.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Just $1 Per Ad</h3>
              <p>Affordable pricing that scales with your business. No hidden fees.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>AI-Powered</h3>
              <p>Advanced AI technology that understands what converts and sells.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📧</div>
              <h3>Email Delivery</h3>
              <p>Your ads are automatically sent to your email, ready to use.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Competitor Analysis</h3>
              <p>Learn from what works. Copy and improve on successful strategies.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Multi-Platform</h3>
              <p>Perfect for Facebook, Instagram, Google Ads, and more.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Upload Images</h3>
              <p>Upload your product image and an inspiration ad you want to copy</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>AI Generates</h3>
              <p>Our AI creates multiple variations based on proven conversion patterns</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Your Ads</h3>
              <p>Receive professional ads in your email, ready to launch</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Outperform Your Competition?</h2>
          <p>Join thousands of businesses already using TOLcreatives to create winning ads</p>
          <div className="cta-buttons">
            <button onClick={onSignUp} className="cta-primary large">
              Start Free Trial
            </button>
            <button onClick={onLogin} className="cta-secondary large">
              Log In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <Logo size="small" showText={true} />
              <p>AI-powered ad generation that converts</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#how-it-works">How it Works</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
                <a href="#blog">Blog</a>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <a href="#help">Help Center</a>
                <a href="#privacy">Privacy</a>
                <a href="#terms">Terms</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 TOLcreatives. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 