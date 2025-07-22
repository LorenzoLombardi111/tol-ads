import React from 'react';
import './Logo.css';

const Logo = ({ size = 'medium', showText = false }) => {
  const sizeClasses = {
    small: 'logo-small',
    medium: 'logo-medium',
    large: 'logo-large'
  };

  return (
    <div className={`logo-container ${sizeClasses[size]}`}>
      <div className="logo-icon">
        <img 
          src="/tolcreativeslogo.png" 
          alt="TOLcreatives Logo" 
          className="logo-image"
        />
      </div>
      {showText && (
        <div className="logo-text">
          <span className="logo-brand">TOL</span>
          <span className="logo-creatives">creatives</span>
        </div>
      )}
    </div>
  );
};

export default Logo; 