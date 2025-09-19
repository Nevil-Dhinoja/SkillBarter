import React, { useRef, useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { user, token, updateUser, fetchUserDetails } = useAuth()
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef(null)

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '')
      setBio(user.bio || '')
      setLocation(user.location || '')
      setAvatarUrl(user.profile_picture || '')
      setSelectedFile(null) // Reset selected file when user changes
    }
  }, [user])

  const onPickFile = () => fileRef.current?.click()
  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }
    
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setAvatarUrl(url)
    setError('') // Clear any previous errors
  }

  // Handle profile update
  const handleSaveProfile = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('full_name', fullName)
      formData.append('bio', bio)
      formData.append('location', location)
      
      // Add profile picture if selected
      if (selectedFile) {
        formData.append('profile_picture', selectedFile)
      }

      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type header - let browser set it with boundary for FormData
        },
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        updateUser(data.data)
        setSuccess('Profile updated successfully!')
        setSelectedFile(null) // Clear selected file after successful upload
        // Fetch fresh user details to ensure navbar is updated
        await fetchUserDetails()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to update profile')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 p-md-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 p-md-5">
              <h2 className="h4 mb-4">My Profile</h2>

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

              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="position-relative">
                  <div className="avatar bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', borderRadius: '50%' }}>
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl.startsWith('blob:') ? avatarUrl : `http://localhost:5000${avatarUrl}`} 
                        alt="Profile" 
                        style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <i className="bi bi-person fs-3" />
                    )}
                  </div>
                </div>
                <div>
                  <input type="file" ref={fileRef} className="d-none" accept="image/*" onChange={onFileChange} />
                  <button type="button" className="btn btn-outline-primary" onClick={onPickFile}>
                    {selectedFile ? 'Change Photo' : (avatarUrl ? 'Change Photo' : 'Upload Photo')}
                  </button>
                  {selectedFile && (
                    <div className="text-muted small mt-1">
                      Selected: {selectedFile.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Full Name</label>
                  <input 
                    className="form-control" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    placeholder="John Doe" 
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Email</label>
                  <input 
                    className="form-control" 
                    value={user?.email || ''} 
                    disabled 
                    placeholder="your@email.com" 
                  />
                  <div className="form-text">Email cannot be changed after registration</div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Location</label>
                  <input 
                    className="form-control" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    placeholder="City, Country" 
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Bio / About Me</label>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    placeholder="Tell others about your background and interests..." 
                  />
                </div>
              </div>

              <div className="mt-4">
                <button 
                  className="btn btn-primary btn-lg shadow-sm" 
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Saving Profile...
                    </>
                  ) : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile


