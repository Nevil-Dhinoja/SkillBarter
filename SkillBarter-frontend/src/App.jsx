import { useEffect, useState } from 'react'
import './App.css'
import { default as LandingPage } from './pages/LandingPage.jsx'
import { default as Login } from './pages/Login.jsx'
import { default as Register } from './pages/Register.jsx'
import { default as Dashboard } from './pages/Dashboard.jsx'
import { default as AdminDashboard } from './pages/AdminDashboard.jsx'
import { default as QuizPerformance } from './pages/QuizPerformance.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx'

// App content component that uses auth context
function AppContent() {
  const { user, loading, isAuthenticated } = useAuth()
  const [view, setView] = useState('landing')
  const [activeKey, setActiveKey] = useState('dashboard')
  const [theme, setTheme] = useState(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('sb-theme') : null
    if (stored === 'light' || stored === 'dark') return stored
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme)
    localStorage.setItem('sb-theme', theme)
  }, [theme])

  // Set view based on authentication status
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated()) {
        // Check if user is admin
        if (user && user.email === 'admin@skillbarter.com') {
          setView('admin')
        } else {
          setView('dashboard')
        }
      } else {
        setView('landing')
      }
    }
  }, [user, loading, isAuthenticated])

  // Handle hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        setActiveKey(hash)
      } else {
        setActiveKey('dashboard')
      }
    }

    // Check initial hash
    handleHashChange()
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-3 text-muted">Loading SkillBarter...</div>
        </div>
      </div>
    )
  }

  if (view === 'landing') {
    return (
      <LandingPage
        onSwitchToLogin={() => setView('login')}
        onSwitchToRegister={() => setView('register')}
      />
    )
  }

  if (view === 'login') {
    return (
      <Login
        onSwitchToRegister={() => setView('register')}
        onSwitchToLanding={() => setView('landing')}
        onSuccess={() => setView('dashboard')}
      />
    )
  }

  if (view === 'register') {
    return (
      <Register
        onSwitchToLogin={() => setView('login')}
        onSwitchToLanding={() => setView('landing')}
        onSuccess={() => setView('dashboard')}
      />
    )
  }

  if (view === 'admin') {
    return (
      <AdminDashboard />
    )
  }

  // For standalone quiz performance page (if needed)
  if (view === 'quiz-performance') {
    return (
      <QuizPerformance />
    )
  }

  return (
    <Dashboard
      activeKey={activeKey}
      setActiveKey={setActiveKey}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  )
}

// Main App component with AuthProvider and SocketProvider
function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  )
}

export default App