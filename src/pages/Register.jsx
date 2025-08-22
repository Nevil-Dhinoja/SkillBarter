import React from 'react'

function Register({ onSwitchToLogin, onSuccess }) {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
      <div className="card shadow-sm auth-card">
        <div className="card-body p-4 p-md-5">
          <div className="mb-4 text-center">
            <div className="fs-3 fw-bold">SkillBarter</div>
            <div className="text-secondary small">Create your account</div>
          </div>
          <div className="mb-3">
            <label htmlFor="regName" className="form-label">Name</label>
            <input type="text" id="regName" className="form-control" placeholder="Jane Doe" />
          </div>
          <div className="mb-3">
            <label htmlFor="regEmail" className="form-label">Email</label>
            <input type="email" id="regEmail" className="form-control" placeholder="you@example.com" />
          </div>
          <div className="mb-3">
            <label htmlFor="regPassword" className="form-label">Password</label>
            <input type="password" id="regPassword" className="form-control" placeholder="••••••••" />
          </div>
          <div className="mb-4">
            <label htmlFor="regConfirm" className="form-label">Confirm Password</label>
            <input type="password" id="regConfirm" className="form-control" placeholder="••••••••" />
          </div>
          <button className="btn btn-primary w-100 shadow-sm mb-3" onClick={onSuccess}>Register</button>
          <div className="text-center small">
            Already have an account?{' '}
            <button className="btn btn-link p-0 align-baseline" onClick={onSwitchToLogin}>Login</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register


