import React, { useRef, useState } from 'react'
import TagInput from '../components/TagInput'

function Profile() {
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [teach, setTeach] = useState(['Photoshop'])
  const [learn, setLearn] = useState(['Guitar'])
  const [avatarUrl, setAvatarUrl] = useState('')
  const fileRef = useRef(null)

  const onPickFile = () => fileRef.current?.click()
  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAvatarUrl(url)
  }

  return (
    <div className="p-4 p-md-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 p-md-5">
              <h2 className="h4 mb-4">Complete Your Profile</h2>

              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="position-relative">
                  <div className="avatar bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px', borderRadius: '50%' }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Preview" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <i className="bi bi-person fs-3" />
                    )}
                  </div>
                </div>
                <div>
                  <input type="file" ref={fileRef} className="d-none" accept="image/*" onChange={onFileChange} />
                  <button type="button" className="btn btn-outline-primary" onClick={onPickFile}>Upload Photo</button>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Location</label>
                  <input className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
                </div>
                <div className="col-12">
                  <label className="form-label">Bio / About Me</label>
                  <textarea className="form-control" rows="4" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell others about your background and interests..." />
                </div>
              </div>

              <div className="row g-4 mt-1">
                <div className="col-12 col-md-6">
                  <TagInput label="Skills I Can Teach" value={teach} onChange={setTeach} />
                </div>
                <div className="col-12 col-md-6">
                  <TagInput label="Skills I Want to Learn" value={learn} onChange={setLearn} />
                </div>
              </div>

              <div className="mt-4">
                <button className="btn btn-primary btn-lg shadow-sm" type="button">Save Profile</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile


