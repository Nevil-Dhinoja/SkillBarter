import React from 'react'
import Lottie from 'lottie-react'
import skillAnimation from '../assets/skill-animation.json'

function LandingPage({ onSwitchToLogin, onSwitchToRegister }) {
  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <a className="navbar-brand fw-bold text-primary fs-4" href="#" onClick={(e) => { e.preventDefault(); }}>
            🎯 SkillBarter
          </a>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link" href="#features">Features</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#how-it-works">How It Works</a>
              </li>
            </ul>
            
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary"
                onClick={onSwitchToLogin}
              >
                Login
              </button>
              <button 
                className="btn btn-primary"
                onClick={onSwitchToRegister}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-grow-1 d-flex align-items-center bg-gradient-primary text-white">
        <div className="container">
          <div className="row align-items-center min-vh-75">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4" style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                Trade Skills, Build Connections
              </h1>
              <p className="lead mb-4" style={{ color: '#f8f9fa', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                Join SkillBarter and exchange your expertise with others. 
                Learn new skills while teaching what you know best.
              </p>
              <div className="d-flex gap-3">
                <button 
                  className="btn btn-light btn-lg px-4"
                  onClick={onSwitchToRegister}
                >
                  Get Started Free
                </button>
                <button 
                  className="btn btn-outline-light btn-lg px-4"
                  onClick={onSwitchToLogin}
                >
                  Sign In
                </button>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div className="hero-image">
                <div className="bg-white rounded-4 p-4 shadow-lg">
                  <Lottie 
                    animationData={skillAnimation}
                    loop={true}
                    autoplay={true}
                    style={{ 
                      width: '100%', 
                      height: '400px',
                      maxWidth: '500px'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-12">
              <h2 className="display-5 fw-bold mb-3" style={{ color: '#2563eb' }}>
                Why Choose SkillBarter?
              </h2>
              <p className="lead" style={{ color: '#333' }}>Discover the benefits of skill exchange</p>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card h-100">
                <div className="card-body text-center p-4">
                  <div className="fs-1 mb-3" style={{ color: '#2563eb' }}>🔄</div>
                  <h5 className="card-title fw-bold" style={{ color: '#333' }}>Skill Exchange</h5>
                  <p className="card-text" style={{ color: '#555' }}>
                    Trade your expertise for new skills. Teach what you know and learn what you need.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="feature-card h-100">
                <div className="card-body text-center p-4">
                  <div className="fs-1 mb-3" style={{ color: '#2563eb' }}>🎯</div>
                  <h5 className="card-title fw-bold" style={{ color: '#333' }}>Skill Matching</h5>
                  <p className="card-text" style={{ color: '#555' }}>
                    Our smart algorithm matches you with people who have complementary skills.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="feature-card h-100">
                <div className="card-body text-center p-4">
                  <div className="fs-1 mb-3" style={{ color: '#2563eb' }}>📊</div>
                  <h5 className="card-title fw-bold" style={{ color: '#333' }}>Progress Tracking</h5>
                  <p className="card-text" style={{ color: '#555' }}>
                    Track your learning journey with quizzes and performance analytics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-5" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-12">
              <h2 className="display-5 fw-bold mb-3" style={{ color: '#2563eb' }}>
                How It Works
              </h2>
              <p className="lead" style={{ color: '#333' }}>Get started in three simple steps</p>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4 text-center">
              <div className="position-relative">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: '80px', height: '80px', background: '#2563eb' }}>
                  <span className="fs-3 fw-bold text-white">1</span>
                </div>
                <h5 className="mb-3 fw-bold" style={{ color: '#333' }}>Create Your Profile</h5>
                <p style={{ color: '#555' }}>
                  Sign up and list the skills you can teach and want to learn.
                </p>
              </div>
            </div>
            
            <div className="col-md-4 text-center">
              <div className="position-relative">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: '80px', height: '80px', background: '#2563eb' }}>
                  <span className="fs-3 fw-bold text-white">2</span>
                </div>
                <h5 className="mb-3 fw-bold" style={{ color: '#333' }}>Find Matches</h5>
                <p style={{ color: '#555' }}>
                  Discover people with complementary skills and connect with them.
                </p>
              </div>
            </div>
            
            <div className="col-md-4 text-center">
              <div className="position-relative">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: '80px', height: '80px', background: '#2563eb' }}>
                  <span className="fs-3 fw-bold text-white">3</span>
                </div>
                <h5 className="mb-3 fw-bold" style={{ color: '#333' }}>Start Learning</h5>
                <p style={{ color: '#555' }}>
                  Begin your skill exchange journey and track your progress.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 cta-section text-white">
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="display-5 fw-bold mb-4">Ready to Start Your Skill Journey?</h2>
              <p className="lead mb-4">
                Join thousands of learners and teachers on SkillBarter today.
              </p>
              <button 
                className="btn btn-light btn-lg px-5 fw-bold"
                onClick={onSwitchToRegister}
                style={{ 
                  background: '#ffffff',
                  color: '#2563eb',
                  border: '2px solid #2563eb',
                  boxShadow: '0 8px 25px rgba(37, 99, 235, 0.2)'
                }}
              >
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="mb-0">&copy; 2025 SkillBarter. All rights reserved.</p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="d-flex justify-content-md-end gap-3">
                <a href="#" className="text-white text-decoration-none">Privacy Policy</a>
                <a href="#" className="text-white text-decoration-none">Terms of Service</a>
                <a href="#" className="text-white text-decoration-none">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
