import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext';

function Register({ onSwitchToLogin, onSwitchToLanding, onSuccess }) {
  const { login } = useAuth()
  const [currentStep, setCurrentStep] = useState(1); // 1: Register, 2: OTP Verification
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    bio: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.full_name || !formData.email || !formData.password) {
      setError('Full name, email, and password are required');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          location: formData.location,
          bio: formData.bio
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Registration successful! Please check your email for the OTP.');
        setCurrentStep(2);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp_code: otp
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Email verified successfully! You can now login.');
        // Save token if provided (user gets token after OTP verification)
        if (data.data.token) {
          login(data.data.user, data.data.token);
          // Redirect to dashboard or call success callback
          setTimeout(() => {
            onSuccess && onSuccess();
          }, 1500);
        }
      } else {
        setError(data.message || 'OTP verification failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('New OTP sent to your email');
        setOtp('');
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
      setError('');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
      <div className="card shadow-sm auth-card">
        <div className="card-body p-4 p-md-5">
          <div className="mb-4 text-center">
            <div className="fs-3 fw-bold">SkillBarter</div>
            <div className="text-secondary small">
              {currentStep === 1 ? 'Create your account' : 'Verify your email'}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-4">
            <div className="d-flex justify-content-center">
              <div className="d-flex align-items-center">
                <div className={`rounded-circle d-flex align-items-center justify-content-center ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-secondary text-white'}`} style={{width: '30px', height: '30px', fontSize: '14px'}}>
                  {currentStep > 1 ? '✓' : '1'}
                </div>
                <div className={`mx-2 ${currentStep > 1 ? 'bg-primary' : 'bg-secondary'}`} style={{height: '2px', width: '50px'}}></div>
                <div className={`rounded-circle d-flex align-items-center justify-content-center ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-secondary text-white'}`} style={{width: '30px', height: '30px', fontSize: '14px'}}>
                  2
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-center mt-2">
              <small className="text-muted">
                {currentStep === 1 ? 'Registration' : 'Email Verification'}
              </small>
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {success}
              <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
            </div>
          )}

          {/* Step 1: Registration Form */}
          {currentStep === 1 && (
            <form onSubmit={handleRegister}>
              <div className="row">
                <div className="col-12 mb-3">
                  <label htmlFor="full_name" className="form-label">Full Name <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    id="full_name" 
                    name="full_name"
                    className="form-control" 
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-12 mb-3">
                  <label htmlFor="email" className="form-label">Email <span className="text-danger">*</span></label>
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
                <div className="col-md-6 mb-3">
                  <label htmlFor="password" className="form-label">Password <span className="text-danger">*</span></label>
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
                <div className="col-md-6 mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password <span className="text-danger">*</span></label>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    name="confirmPassword"
                    className="form-control" 
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-12 mb-3">
                  <label htmlFor="location" className="form-label">Location</label>
                  <input 
                    type="text" 
                    id="location" 
                    name="location"
                    className="form-control" 
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-12 mb-3">
                  <label htmlFor="bio" className="form-label">Bio</label>
                  <textarea 
                    id="bio" 
                    name="bio"
                    className="form-control" 
                    rows="3"
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-100 shadow-sm mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creating Account...
                  </>
                ) : 'Create Account'}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {currentStep === 2 && (
            <div>
              <div className="text-center mb-4">
                <div className="fs-1 mb-3">📧</div>
                <h5>Check your email</h5>
                <p className="text-muted small">
                  We've sent a 6-digit verification code to<br />
                  <strong>{formData.email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP}>
                <div className="mb-3">
                  <label htmlFor="otp" className="form-label text-center d-block">Enter OTP</label>
                  <input 
                    type="text" 
                    id="otp"
                    className="form-control text-center fs-4 letter-spacing-wide"
                    placeholder="000000"
                    value={otp}
                    onChange={handleOtpChange}
                    maxLength="6"
                    style={{letterSpacing: '0.5em'}}
                    required
                  />
                  <div className="form-text text-center">
                    Enter the 6-digit code from your email
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 shadow-sm mb-3"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Verifying...
                    </>
                  ) : 'Verify Email'}
                </button>
              </form>

              <div className="text-center">
                <p className="small text-muted mb-2">Didn't receive the code?</p>
                <button 
                  type="button"
                  className="btn btn-link p-0"
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </div>

              <hr className="my-4" />
              
              <div className="text-center">
                <button 
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setCurrentStep(1)}
                >
                  ← Back to Registration
                </button>
              </div>
            </div>
          )}

          {/* Login Link */}
          {currentStep === 1 && (
            <>
              <div className="text-center small mb-2">
                <button className="btn btn-link p-0 align-baseline" onClick={onSwitchToLanding}>
                  ← Back to Home
                </button>
              </div>
              <div className="text-center small">
                Already have an account?{' '}
                <button className="btn btn-link p-0 align-baseline" onClick={onSwitchToLogin}>
                  Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;