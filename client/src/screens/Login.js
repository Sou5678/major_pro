import React, { useState } from 'react';
import { Link, Form, useActionData, useNavigation } from 'react-router-dom';

export async function loginAction({ request }) {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock validation
  if (!email || !password) {
    return {
      success: false,
      error: 'Email and password are required'
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: 'Password must be at least 6 characters'
    };
  }

  // Mock successful login
  return {
    success: true,
    message: 'Login successful!'
  };
}

export default function Login() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Welcome Back</div>
          <div className="muted">Sign in to your account</div>
        </div>

        <Form method="post" className="card">
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

          <div style={{ marginBottom: 24 }}>
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
              placeholder="Enter your password"
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
            {isSubmitting ? 'Signing In...' : 'Sign In'}
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
              Don't have an account?{' '}
            </span>
            <Link 
              to="/signup" 
              style={{ 
                color: '#58a6ff', 
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Sign up
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