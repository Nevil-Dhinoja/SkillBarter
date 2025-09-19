import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function Settings({ theme = 'light' }) {
  const { user, token } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('All password fields are required')
      setLoading(false)
      return
    }

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long')
      setLoading(false)
      return
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Password updated successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmNewPassword('')
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(data.message || 'Failed to update password')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 p-md-5" style={{ backgroundColor: 'var(--sb-body-bg)' }}>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 p-md-5">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                  <i className="bi bi-gear fs-5"></i>
                </div>
                <div>
                  <h2 className="h4 mb-1">Account Settings</h2>
                  <p className="text-muted mb-0">Manage your account security and preferences</p>
                </div>
              </div>

              {/* Account Information */}
              <div className="mb-5">
                <h3 className="h5 mb-3">Account Information</h3>
                <div 
                  className="rounded p-3" 
                  style={{ 
                    backgroundColor: theme === 'dark' ? 'var(--sb-input-bg)' : 'var(--sb-input-bg)',
                    border: theme === 'dark' ? '1px solid var(--sb-border-color)' : '1px solid #e9ecef'
                  }}
                >
                  <div className="row">
                    <div className="col-sm-6 mb-2">
                      <strong>Full Name:</strong> {user?.full_name || 'Not set'}
                    </div>
                    <div className="col-sm-6 mb-2">
                      <strong>Email:</strong> {user?.email || 'Not set'}
                    </div>
                    <div className="col-sm-6 mb-2">
                      <strong>Location:</strong> {user?.location || 'Not set'}
                    </div>
                    <div className="col-sm-6 mb-2">
                      <strong>Member Since:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Change Section */}
              <div className="mb-4">
                <h3 className="h5 mb-3">Change Password</h3>
                
                {/* Alert Messages */}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                  </div>
                )}
                
                {success && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {success}
                    <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                  </div>
                )}

                <form onSubmit={handlePasswordReset}>
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">Current Password</label>
                    <input 
                      type="password" 
                      id="currentPassword"
                      className="form-control" 
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">New Password</label>
                    <input 
                      type="password" 
                      id="newPassword"
                      className="form-control" 
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <div className="form-text">Password must be at least 6 characters long</div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="confirmNewPassword" className="form-label">Confirm New Password</label>
                    <input 
                      type="password" 
                      id="confirmNewPassword"
                      className="form-control" 
                      placeholder="Confirm your new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary shadow-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-shield-check me-2"></i>
                        Update Password
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Security Note */}
              <div 
                className="border-start border-warning border-4 p-3 rounded" 
                style={{ 
                  backgroundColor: theme === 'dark' ? 'var(--sb-input-bg)' : '#fff3cd',
                  border: theme === 'dark' ? '1px solid var(--sb-border-color)' : '1px solid #ffeaa7'
                }}
              >
                <h6 className="text-warning">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  Security Tips
                </h6>
                <ul className="small text-muted mb-0">
                  <li>Use a strong password with a mix of letters, numbers, and symbols</li>
                  <li>Don't reuse passwords from other accounts</li>
                  <li>Consider using a password manager</li>
                  <li>Never share your password with others</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings