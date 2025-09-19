import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function Login({ onSwitchToRegister, onSwitchToLanding, onSuccess }) {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email, 2: otp+password
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Use AuthContext to handle login
        login(data.data.user, data.data.token);
        
        // Call success callback
        onSuccess && onSuccess();
      } else {
        // Handle different error types
        if (data.requiresVerification) {
          setError(data.message + ' Click "Register" to resend verification email if needed.');
        } else {
          setError(data.message || 'Login failed');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');

    if (!forgotPasswordEmail) {
      setForgotPasswordError('Please enter your email address');
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setForgotPasswordSuccess('Password reset OTP sent to your email!');
        setForgotPasswordStep(2);
      } else {
        setForgotPasswordError(data.message || 'Failed to send reset email');
      }
    } catch (err) {
      setForgotPasswordError('Network error. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');

    if (!otp || !newPassword || !confirmNewPassword) {
      setForgotPasswordError('All fields are required');
      setForgotPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotPasswordError('Passwords do not match');
      setForgotPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setForgotPasswordError('Password must be at least 6 characters long');
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordEmail,
          otp_code: otp,
          newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        setForgotPasswordSuccess('Password reset successful! You can now login with your new password.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordStep(1);
          setForgotPasswordEmail('');
          setOtp('');
          setNewPassword('');
          setConfirmNewPassword('');
          setForgotPasswordError('');
          setForgotPasswordSuccess('');
        }, 2000);
      } else {
        setForgotPasswordError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setForgotPasswordError('Network error. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
      <div className="card shadow-sm auth-card">
        <div className="card-body p-4 p-md-5">
          {!showForgotPassword ? (
            <>
              <div className="mb-4 text-center">
                <div className="fs-3 fw-bold">SkillBarter</div>
                <div className="text-secondary small">Welcome back</div>
              </div>
              
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
              )}
              
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    className="form-control" 
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input 
                    type="password" 
                    id="password" 
                    name="password"
                    className="form-control" 
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 shadow-sm mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Logging in...
                    </>
                  ) : 'Login'}
                </button>
              </form>
              
              <div className="text-center mb-3">
                <button 
                  className="btn btn-link p-0 small" 
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
              </div>
              
              <div className="text-center small mb-2">
                <button className="btn btn-link p-0 align-baseline" onClick={onSwitchToLanding}>
                  ← Back to Home
                </button>
              </div>
              <div className="text-center small">
                Don't have an account?{' '}
                <button className="btn btn-link p-0 align-baseline" onClick={onSwitchToRegister}>Register</button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 text-center">
                <div className="fs-3 fw-bold">Reset Password</div>
                <div className="text-secondary small">
                  {forgotPasswordStep === 1 ? 'Enter your email to get reset code' : 'Enter OTP and new password'}
                </div>
              </div>

              {forgotPasswordError && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {forgotPasswordError}
                  <button type="button" className="btn-close" onClick={() => setForgotPasswordError('')}></button>
                </div>
              )}

              {forgotPasswordSuccess && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  {forgotPasswordSuccess}
                  <button type="button" className="btn-close" onClick={() => setForgotPasswordSuccess('')}></button>
                </div>
              )}

              {forgotPasswordStep === 1 ? (
                <form onSubmit={handleForgotPassword}>
                  <div className="mb-3">
                    <label htmlFor="forgotEmail" className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      id="forgotEmail"
                      className="form-control" 
                      placeholder="Enter your registered email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 shadow-sm mb-3"
                    disabled={forgotPasswordLoading}
                  >
                    {forgotPasswordLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Sending OTP...
                      </>
                    ) : 'Send Reset Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePasswordReset}>
                  <div className="mb-3">
                    <label htmlFor="resetOtp" className="form-label">OTP Code</label>
                    <input 
                      type="text" 
                      id="resetOtp"
                      className="form-control" 
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength="6"
                      required
                    />
                    <div className="form-text">Check your email for the 6-digit verification code</div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="resetNewPassword" className="form-label">New Password</label>
                    <input 
                      type="password" 
                      id="resetNewPassword"
                      className="form-control" 
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="resetConfirmPassword" className="form-label">Confirm New Password</label>
                    <input 
                      type="password" 
                      id="resetConfirmPassword"
                      className="form-control" 
                      placeholder="Confirm new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-success w-100 shadow-sm mb-3"
                    disabled={forgotPasswordLoading}
                  >
                    {forgotPasswordLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Resetting Password...
                      </>
                    ) : 'Reset Password'}
                  </button>
                </form>
              )}

              <div className="text-center">
                <button 
                  className="btn btn-link p-0 small" 
                  onClick={() => {
                    setShowForgotPassword(false)
                    setForgotPasswordStep(1)
                    setForgotPasswordEmail('')
                    setOtp('')
                    setNewPassword('')
                    setConfirmNewPassword('')
                    setForgotPasswordError('')
                    setForgotPasswordSuccess('')
                  }}
                >
                  ← Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login


