import React from 'react'

function Login({ onSwitchToRegister, onSuccess }) {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
      <div className="card shadow-sm auth-card">
        <div className="card-body p-4 p-md-5">
          <div className="mb-4 text-center">
            <div className="fs-3 fw-bold">SkillBarter</div>
            <div className="text-secondary small">Welcome back</div>
          </div>
          <div className="mb-3">
            <label htmlFor="loginEmail" className="form-label">Email</label>
            <input type="email" id="loginEmail" className="form-control" placeholder="you@example.com" />
          </div>
          <div className="mb-3">
            <label htmlFor="loginPassword" className="form-label">Password</label>
            <input type="password" id="loginPassword" className="form-control" placeholder="••••••••" />
          </div>
          <button className="btn btn-primary w-100 shadow-sm mb-3" onClick={onSuccess}>Login</button>
          <div className="text-center small">
            Don't have an account?{' '}
            <button className="btn btn-link p-0 align-baseline" onClick={onSwitchToRegister}>Register</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login


