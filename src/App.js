import './App.css';
import './components/StaticStats.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import SignUp from './components/SignUp';
import Dashboard from './Dashboard';
import LandingPage from './components/LandingPage';
import PurchaseCredits from './components/PurchaseCredits';
import Logo from './Logo';
import { supabase } from './supabaseClient';

// Protected Route Component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Main App Component
function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const userData = {
            email: session.user.email,
            name: session.user.email.split('@')[0],
            id: session.user.id
          };
          setUserData(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUserData(null);
        }
      }
    );

    // Cleanup subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const userData = {
          email: user.email,
          name: user.email.split('@')[0],
          id: user.id
        };
        setUserData(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  // Handle login
  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setUserData(user);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="App">
        <div className="loading-screen">
          <div className="loading-content">
            <div className="logo-animation">
              <Logo size="large" />
            </div>
            <div className="loading-text">
              <h3>Loading TOLcreatives</h3>
              <p>Preparing your workspace...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Landing Page - Always accessible */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Login Page */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Login onLogin={handleLogin} />
          } 
        />
        
        {/* Sign Up Page */}
        <Route 
          path="/signup" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <SignUp onSignUpSuccess={() => window.location.href = '/login'} />
          } 
        />
        
        {/* Dashboard - Protected Route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardApp userData={userData} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect any unknown routes to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Dashboard App Component (separate from main App for routing)
function DashboardApp({ userData, onLogout }) {
  // Navigation state
  const [currentView, setCurrentView] = useState('dashboard');

  // Modal state
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Your existing states for ad generation
  const [productImage, setProductImage] = useState(null);
  const [inspirationImage, setInspirationImage] = useState(null);
  const [productDescription, setProductDescription] = useState('');
  const [productSize, setProductSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [dragActive, setDragActive] = useState({ product: false, inspiration: false });
  const [userEmail, setUserEmail] = useState(userData?.email || '');
  const [emailError, setEmailError] = useState('');
  const [rememberEmail, setRememberEmail] = useState(true);

  // Set email when userData changes
  useEffect(() => {
    if (userData?.email) {
      setUserEmail(userData.email);
    }
  }, [userData]);

  // Handle purchase success
  const handlePurchaseSuccess = () => {
    setShowPurchaseModal(false);
    // Optionally refresh credits or show success message
  };

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Handle email input change
  const handleEmailChange = (e) => {
    const email = e.target.value;
    setUserEmail(email);
    if (emailError) {
      validateEmail(email);
    }
  };

  // Handle remember email checkbox
  const handleRememberEmail = (e) => {
    const checked = e.target.checked;
    setRememberEmail(checked);
    if (checked && userEmail) {
      localStorage.setItem('userEmail', userEmail);
    } else {
      localStorage.removeItem('userEmail');
    }
  };

  // File validation
  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File is too large! Please use images under 5MB.');
      return false;
    }
    // Check specifically for JPG/JPEG format
    if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
      setError('Please upload a JPG/JPEG image file only.');
      return false;
    }
    setError('');
    return true;
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle file processing
  const processFile = async (file, type) => {
    if (validateFile(file)) {
      try {
        const base64 = await fileToBase64(file);
        if (type === 'product') {
          setProductImage(base64);
          setSuccess('Product image uploaded successfully!');
        } else {
          setInspirationImage(base64);
          setSuccess('Inspiration image uploaded successfully!');
        }
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to process image');
      }
    }
  };

  // Click upload handlers
  const handleProductImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) processFile(file, 'product');
  };

  const handleInspirationImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) processFile(file, 'inspiration');
  };

  // Drag handlers
  const handleDrag = (e, type, isEntering) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEntering) {
      setDragActive({ ...dragActive, [type]: true });
    }
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive({ ...dragActive, [type]: false });
  };

  const handleDrop = async (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive({ ...dragActive, [type]: false });

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file, type);
    }
  };

  // Generate ads with email - UPDATED with credit validation and deduction
  const generateAds = async () => {
    // Validate all inputs
    if (!productImage || !inspirationImage) {
      setError('Please upload both images first!');
      return;
    }

    if (!productDescription.trim()) {
      setError('Please enter a product description!');
      return;
    }

    if (!productSize.trim()) {
      setError('Please enter the ad size in pixels!');
      return;
    }

    if (!validateEmail(userEmail)) {
      return;
    }

    // Check credits first (added this block)
    try {
      const { data: userCredits, error: creditsError } = await supabase
        .from('user_credits')
        .select('credits_available')
        .eq('user_id', userData.id)
        .single();

      if (creditsError) {
        setError('Unable to check your credits. Please try again.');
        return;
      }

      const availableCredits = userCredits?.credits_available || 0;
      if (availableCredits < 1) {
        setError('You don\'t have enough credits to generate ads. Please purchase more credits.');
        return;
      }

      // Deduct 1 credit
      const { data: creditResult, error: deductionError } = await supabase
        .rpc('update_user_credits', {
          target_user_id: userData.id,
          credit_change: -1,
          transaction_type: 'usage',
          description: 'Ad generation - 1 credit used'
        });

      if (deductionError || !creditResult.success) {
        setError('Failed to process credits. Please try again.');
        return;
      }
    } catch (error) {
      setError('Unable to verify your credits. Please try again.');
      return;
    }

    // Save email if remember is checked
    if (rememberEmail) {
      localStorage.setItem('userEmail', userEmail);
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // First, create a record in Supabase
      const { data: adRecord, error: dbError } = await supabase
        .from('ad_history')
        .insert([
          {
            user_id: userData.id,
            product_image_url: productImage,
            inspiration_image_url: inspirationImage,
            product_description: productDescription,
            product_size: productSize,
            email_sent_to: userEmail,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      // Send to n8n webhook with the record ID
      const response = await axios.post(process.env.REACT_APP_N8N_WEBHOOK_URL, {
        productImage: productImage,
        inspirationImage: inspirationImage,
        productDescription: productDescription,
        productSize: productSize,
        userEmail: userEmail,
        userId: userData.id,
        userName: userData.name,
        recordId: adRecord.id // Send this to n8n so it can update the record later
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000
      });

      // Success!
      setSubmitted(true);
      setSuccess(`Success! We got your images. Check your email (${userEmail}) in 5 minutes. 1 credit deducted.`);
      
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        setError(`Server error: ${error.response.status}. Please try again.`);
      } else if (error.request) {
        setError('No response from server. Check your connection and try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
    
    setLoading(false);
  };

  const resetAll = () => {
    setProductImage(null);
    setInspirationImage(null);
    setProductDescription('');
    setProductSize('');
    setError('');
    setSuccess('');
    setSubmitted(false);
    // Keep email if remember is checked
    if (!rememberEmail) {
      setUserEmail('');
    }
  };

  // Navigation component
  const Navigation = () => (
    <div className="navigation-tabs">
      <button
        className={`nav-tab ${currentView === 'dashboard' ? 'active' : ''}`}
        onClick={() => setCurrentView('dashboard')}
      >
        Dashboard
      </button>
      <button
        className={`nav-tab ${currentView === 'generate' ? 'active' : ''}`}
        onClick={() => {
          setCurrentView('generate');
          resetAll();
        }}
      >
        Generate New Ad
      </button>
    </div>
  );

  return (
    <div className="App">
      {/* User Header */}
      <div className="user-header">
        <div className="user-info">
          <span>Welcome, {userData?.name || userData?.email}!</span>
        </div>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="main-header">
        <div className="header-content">
          <div className="logo-section">
            <Logo size="large" />
          </div>
          <div className="header-nav">
            <Navigation />
          </div>
        </div>
      </div>

      <div className="main-content">
        {currentView === 'dashboard' ? (
          <Dashboard 
            userId={userData.id} 
            showPurchaseModal={showPurchaseModal}
            setShowPurchaseModal={setShowPurchaseModal}
          />
        ) : (
        <>
          <p className="subtitle">Drag & drop or click to upload images</p>
          <div className="image-format-disclaimer">
            <p>
              <span className="disclaimer-icon">ℹ️</span>
              <strong>Recommended:</strong> Use JPG images for best results. 
              <a 
                href="https://convertio.co/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="convert-link"
              >
                Convert your images to JPG here
              </a>
            </p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          {!submitted ? (
            <>
              <div className="upload-section">
                {/* Product Image Upload */}
                <div 
                  className={`upload-box ${dragActive.product ? 'drag-active' : ''}`}
                  onDragEnter={(e) => handleDrag(e, 'product', true)}
                  onDragOver={(e) => handleDrag(e, 'product', true)}
                  onDragLeave={(e) => handleDragLeave(e, 'product')}
                  onDrop={(e) => handleDrop(e, 'product')}
                >
                  <h3>Product Image</h3>
                  {!productImage ? (
                    <>
                      <div className="upload-icon">
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                      </div>
                      <p>Drag & drop your product image here</p>
                      <p className="or">or</p>
                      <input 
                        type="file" 
                        accept=".jpg,.jpeg,image/jpeg,image/jpg" 
                        onChange={handleProductImageUpload}
                        id="product-upload"
                        className="file-input"
                      />
                      <label htmlFor="product-upload" className="file-label">
                        Browse Files
                      </label>
                    </>
                  ) : (
                    <div className="preview-container">
                      <img src={productImage} alt="Product" className="preview" />
                      <button 
                        className="remove-btn" 
                        onClick={() => setProductImage(null)}
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Inspiration Image Upload */}
                <div 
                  className={`upload-box ${dragActive.inspiration ? 'drag-active' : ''}`}
                  onDragEnter={(e) => handleDrag(e, 'inspiration', true)}
                  onDragOver={(e) => handleDrag(e, 'inspiration', true)}
                  onDragLeave={(e) => handleDragLeave(e, 'inspiration')}
                  onDrop={(e) => handleDrop(e, 'inspiration')}
                >
                  <h3>Inspiration Image</h3>
                  {!inspirationImage ? (
                    <>
                      <div className="upload-icon">
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                      </div>
                      <p>Drag & drop inspiration image here</p>
                      <p className="or">or</p>
                      <input 
                        type="file" 
                        accept=".jpg,.jpeg,image/jpeg,image/jpg" 
                        onChange={handleInspirationImageUpload}
                        id="inspiration-upload"
                        className="file-input"
                      />
                      <label htmlFor="inspiration-upload" className="file-label">
                        Browse Files
                      </label>
                    </>
                  ) : (
                    <div className="preview-container">
                      <img src={inspirationImage} alt="Inspiration" className="preview" />
                      <button 
                        className="remove-btn" 
                        onClick={() => setInspirationImage(null)}
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Input */}
              <div className="email-section">
                <div className="email-input-group">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={userEmail}
                    onChange={handleEmailChange}
                    className={`email-input ${emailError ? 'error' : ''}`}
                  />
                  <label className="remember-email">
                    <input
                      type="checkbox"
                      checked={rememberEmail}
                      onChange={handleRememberEmail}
                    />
                    Remember my email
                  </label>
                </div>
                {emailError && <div className="email-error">{emailError}</div>}
              </div>

              {/* Product Description Input */}
              <div className="input-section">
                <label htmlFor="productDescription" className="input-label">Product Description/Input</label>
                <textarea
                  id="productDescription"
                  placeholder="Describe your product, target audience, style preferences, etc."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="text-input"
                  rows="4"
                />
              </div>

              {/* Ad Size Input */}
              <div className="input-section">
                <label htmlFor="productSize" className="input-label">Ad Size (In pixels)</label>
                <input
                  type="text"
                  id="productSize"
                  placeholder="e.g., 1080x1080, 1200x630, 1920x1080"
                  value={productSize}
                  onChange={(e) => setProductSize(e.target.value)}
                  className="text-input"
                />
              </div>

              {/* Generate Button */}
              <button 
                onClick={generateAds}
                disabled={loading || !productImage || !inspirationImage || !userEmail || !productDescription.trim() || !productSize.trim()}
                className="generate-btn"
              >
                {loading ? 'Generating...' : '1 💎 Generate Ads'}
              </button>
            </>
          ) : (
            <div className="success-section">
              <div className="success-icon">✅</div>
              <h3>Success!</h3>
              <p>Your ad generation request has been submitted successfully.</p>
              <button onClick={resetAll} className="reset-btn">
                Generate Another Ad
              </button>
            </div>
          )}
        </>
        )}
      </div>

      {/* Purchase Credits Modal - Rendered outside main content for proper overlay */}
      {showPurchaseModal && (
        <PurchaseCredits
          userId={userData.id}
          onPurchaseSuccess={handlePurchaseSuccess}
          onClose={() => setShowPurchaseModal(false)}
        />
      )}
    </div>
  );
}

export default App;
