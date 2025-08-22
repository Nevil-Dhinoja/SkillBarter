import { useEffect, useState } from 'react'
import './App.css'
import { default as Login } from './pages/Login.jsx'
import { default as Register } from './pages/Register.jsx'
import { default as Dashboard } from './pages/Dashboard.jsx'

function App() {
  const [view, setView] = useState('login')
  const [activeKey, setActiveKey] = useState('skills')
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

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  if (view === 'login') {
    return (
      <Login
        onSwitchToRegister={() => setView('register')}
        onSuccess={() => setView('dashboard')}
      />
    )
  }

  if (view === 'register') {
    return (
      <Register
        onSwitchToLogin={() => setView('login')}
        onSuccess={() => setView('dashboard')}
      />
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

export default App
