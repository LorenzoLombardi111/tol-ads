import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './Login';
import Dashboard from './Dashboard';
import Logo from './Logo';
import { supabase } from './supabaseClient';

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Navigation state
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'generate'

  // Your existing states for ad generation
  const [productImage, setProductImage] = useState(null);
  const [inspirationImage, setInspirationImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [dragActive, setDragActive] = useState({ product: false, inspiration: false });
  const [userEmail, setUserEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);

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
          setUserEmail(session.user.email);
          setRememberEmail(true);
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
        setUserEmail(user.email);
        setRememberEmail(true);
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
    if (user.email) {
      setUserEmail(user.email);
      setRememberEmail(true);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUserData(null);
      resetAll();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

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
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
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

  // Generate ads with email - UPDATED to save to Supabase
  const generateAds = async () => {
    // Validate all inputs
    if (!productImage || !inspirationImage) {
      setError('Please upload both images first!');
      return;
    }

    if (!validateEmail(userEmail)) {
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
                  setSuccess(`Success! We got your images. Check your email (${userEmail}) in 5 minutes.`);
      
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
        <button onClick={handleLogout} className="logout-button">
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
          <Dashboard userId={userData.id} />
        ) : (
        <>
          <p className="subtitle">Drag & drop or click to upload images</p>
          
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
                        accept="image/*" 
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
                      <p>Drag & drop your inspiration ad here</p>
                      <p className="or">or</p>
                      <input 
                        type="file" 
                        accept="image/*" 
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

              {/* Email Input Section */}
              <div className="email-section">
                <div className="email-container">
                  <h3>Your Email</h3>
                  <p className="email-description">We'll send your generated ads here</p>
                  <div className="email-input-wrapper">
                    <input
                      type="email"
                      value={userEmail}
                      onChange={handleEmailChange}
                      onBlur={() => validateEmail(userEmail)}
                      placeholder="Enter your email address"
                      className={`email-input ${emailError ? 'error' : ''}`}
                    />
                    {emailError && <span className="email-error">{emailError}</span>}
                  </div>
                  <label className="remember-checkbox">
                    <input
                      type="checkbox"
                      checked={rememberEmail}
                      onChange={handleRememberEmail}
                    />
                    <span>Remember my email for next time</span>
                  </label>
                </div>
              </div>

              <div className="button-group">
                <button 
                  onClick={generateAds} 
                  disabled={loading || !productImage || !inspirationImage || !userEmail}
                  className="generate-button"
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      <span>Sending to your email...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Ads</span>
                    </>
                  )}
                </button>
                
                {(productImage || inspirationImage) && (
                  <button onClick={resetAll} className="reset-button">
                    Start Over
                  </button>
                )}
              </div>

              {loading && (
                <div className="loading-message">
                  <p>Processing your request...</p>
                  <p>Your ads will arrive in your inbox soon!</p>
                </div>
              )}
            </>
          ) : (
            // Success state - shown after submission
            <div className="success-state">
              <div className="success-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h2>Success!</h2>
              <p className="success-text">We got your images!</p>
              <p className="success-subtext">Check your email at:</p>
              <p className="email-display">{userEmail}</p>
              <p className="email-hint">Your custom ads will arrive in about 5 minutes.</p>
              
              <button onClick={resetAll} className="new-generation-button">
                Create More Ads
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}

export default App;
