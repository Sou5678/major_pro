import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';
  const isLoginPage = location.pathname === '/login';
  const isSignupPage = location.pathname === '/signup';
  const isAuthPage = isLoginPage || isSignupPage;

  return (
    <header style={{
      background: 'rgba(11, 18, 32, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '16px 0'
    }}>
      <div style={{
        width: 'min(980px, 92vw)',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link 
          to="/" 
          style={{ 
            textDecoration: 'none', 
            color: '#e6edf3',
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: -0.3
          }}
        >
          Resume Analyzer
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isAuthPage ? (
            // Show nothing or just home link on auth pages
            <Link 
              to="/"
              className="btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                fontSize: 14,
                textDecoration: 'none',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              Home
            </Link>
          ) : (
            <>
              <Link 
                to="/login"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#e6edf3',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                Sign In
              </Link>
              
              <Link 
                to={isProfilePage ? "/" : "/profile"}
                className="btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  fontSize: 14,
                  textDecoration: 'none'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  {isProfilePage ? (
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  ) : (
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  )}
                </svg>
                {isProfilePage ? 'Home' : 'Profile'}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}