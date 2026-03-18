import React, { useState } from 'react';
import { Link, Form, useActionData, useNavigation } from 'react-router-dom';

export async function signupAction({ request }) {
  const formData = await request.formData();
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock validation
  if (!name || !email || !password || !confirmPassword) {
    return {
      success: false,
      error: 'All fields are required'
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      error: 'Passwords do not match'
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: 'Password must be at least 6 characters'
    };
  }

  // Mock email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: 'Please enter a valid email address'
    };
  }

  // Mock successful signup
  return {
    success: true,
    message: 'Account created successfully! You can now sign in.'
  };
}

export default function Signup() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="page">
      <div style={{ 
        maxWidth: 400, 
        margin: '0 auto', 
        paddingTop: 40 
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Create Account</div>
          <div className="muted">Join Resume Analyzer today</div>
        </div>

        <Form method="post" className="card">
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'block', 
              fontSize: 14, 
              fontWeight: 600, 
              marginBottom: 8 
            }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              required
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(0,0,0,0.25)',
                color: '#e6edf3',
                fontSize: 14
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'block', 
              fontSize: 14, 
              fontWeight: 600, 
              marginBottom: 8 
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(0,0,0,0.25)',
                color: '#e6edf3',
                fontSize: 14
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'block', 
              fontSize: 14, 
              fontWeight: 600, 
              marginBottom: 8 
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Create a password"
              required
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(0,0,0,0.25)',
                color: '#e6edf3',
                fontSize: 14
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: 'block', 
              fontSize: 14, 
              fontWeight: 600, 
              marginBottom: 8 
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm your password"
              required
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(0,0,0,0.25)',
                color: '#e6edf3',
                fontSize: 14
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn"
            style={{ 
              width: '100%', 
              marginBottom: 16,
              padding: 12
            }}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>

          {actionData?.success === false && (
            <div style={{ 
              color: '#ff6b6b', 
              fontSize: 14, 
              marginBottom: 16,
              textAlign: 'center'
            }}>
              {actionData.error}
            </div>
          )}

          {actionData?.success === true && (
            <div style={{ 
              color: '#4ade80', 
              fontSize: 14, 
              marginBottom: 16,
              textAlign: 'center'
            }}>
              {actionData.message}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <span className="muted" style={{ fontSize: 14 }}>
              Already have an account?{' '}
            </span>
            <Link 
              to="/login" 
              style={{ 
                color: '#58a6ff', 
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Sign in
            </Link>
          </div>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link 
            to="/" 
            style={{ 
              color: '#58a6ff', 
              textDecoration: 'none',
              fontSize: 14
            }}
          >
            ← Continue as Guest
          </Link>
        </div>
      </div>
    </div>
  );
}