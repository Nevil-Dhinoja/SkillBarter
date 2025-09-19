import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'

function Topbar({ theme = 'light', onToggleTheme = () => {} }) {
  const { user, logout, getUserFullName, getUserInitials, sessionStartTime } = useAuth()
  const { notifications, removeNotification, clearNotifications } = useSocket()
  const [timeLeft, setTimeLeft] = useState('')

  // Format time in minutes
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    
    if (minutes > 0) {
      return `${minutes} min`
    } else {
      return `${seconds} sec`
    }
  }

  // Update timer every second
  useEffect(() => {
    if (!sessionStartTime) {
      setTimeLeft('')
      return
    }

    const updateTimer = () => {
      const now = Date.now()
      const elapsed = now - sessionStartTime
      const sessionDuration = 3600 * 1000 // 1 hour in milliseconds
      const timeRemaining = Math.max(0, Math.floor((sessionDuration - elapsed) / 1000))
      
      if (timeRemaining === 0) {
        clearInterval(timer)
        setTimeLeft('')
      } else {
        setTimeLeft(formatTime(timeRemaining))
      }
    }

    updateTimer() // Initial update
    const timer = setInterval(updateTimer, 1000) // Update every second
    
    // Clean up interval on unmount or session change
    return () => clearInterval(timer)
  }, [sessionStartTime])

  const handleLogout = () => {
    logout()
    window.location.reload() // Force reload to reset app state
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message': return '📨'
      case 'friend_request': return '👥'
      case 'friend_accepted': return '✅'
      case 'friend_accepted_success': return '🎉'
      default: return '🔔'
    }
  }

  const formatNotificationTime = (timestamp) => {
    const now = new Date()
    const notifTime = new Date(timestamp)
    const diffMs = now - notifTime
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }
  return (
    <div className="topbar bg-body border-bottom sticky-top">
      <div className="d-flex align-items-center justify-content-between gap-2 p-3">
        {/* Left side - Theme toggle and session timer */}
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            type="button"
            aria-label="Toggle theme"
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            <i className={`bi ${theme === 'light' ? 'bi-moon-stars' : 'bi-sun'}`} />
          </button>

          {/* Session timer display */}
          {timeLeft && (
            <div className="text-muted">
              <i className="bi bi-clock-history me-1" />
              <span>{timeLeft}</span>
            </div>
          )}
        </div>

        {/* Right side - Notifications and Profile dropdown */}
        <div className="d-flex align-items-center gap-2">
          {/* Notification Bell */}
          <div className="dropdown">
            <button
              className={`btn ${theme === 'dark' ? 'btn-outline-light' : 'btn-outline-secondary'} position-relative`}
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              title="Notifications"
            >
              <i className="bi bi-bell" />
              {notifications.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {notifications.length > 99 ? '99+' : notifications.length}
                  <span className="visually-hidden">unread notifications</span>
                </span>
              )}
            </button>
            <ul className="dropdown-menu dropdown-menu-end" style={{ minWidth: '320px', maxHeight: '400px', overflowY: 'auto' }}>
              <li>
                <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                  <h6 className="mb-0">Notifications</h6>
                  {notifications.length > 0 && (
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={clearNotifications}
                      title="Clear all"
                    >
                      <i className="bi bi-trash" />
                    </button>
                  )}
                </div>
              </li>
              {notifications.length === 0 ? (
                <li>
                  <div className="px-3 py-4 text-center text-muted">
                    <i className="bi bi-bell-slash d-block mb-2" style={{ fontSize: '2rem' }} />
                    <p className="mb-0">No new notifications</p>
                  </div>
                </li>
              ) : (
                notifications.map((notification) => (
                  <li key={notification.id}>
                    <div className="dropdown-item-text px-3 py-2 border-bottom position-relative">
                      <button
                        className="btn-close position-absolute top-0 end-0 mt-2 me-2"
                        onClick={() => removeNotification(notification.id)}
                        aria-label="Dismiss notification"
                        style={{ fontSize: '0.75rem' }}
                      />
                      <div className="d-flex align-items-start gap-2">
                        <span className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-grow-1 min-w-0">
                          <p className="mb-1 small fw-semibold">{notification.message}</p>
                          {notification.data?.message && (
                            <p className="mb-1 small text-muted text-truncate">
                              "{notification.data.message}"
                            </p>
                          )}
                          <small className="text-muted">
                            {formatNotificationTime(notification.timestamp)}
                          </small>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Profile dropdown */}
          <div className="dropdown">
          <button
            className={`btn ${theme === 'dark' ? 'btn-outline-light' : 'btn-light'} d-flex align-items-center gap-2 shadow-sm`}
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span className="avatar bg-primary text-white d-inline-flex align-items-center justify-content-center">
              {user?.profile_picture ? (
                <img 
                  src={user.profile_picture.startsWith('http') ? user.profile_picture : `http://localhost:5000${user.profile_picture}`}
                  alt={getUserFullName()} 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => {
                    console.log('Image failed to load:', e.target.src);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                  onLoad={() => console.log('Profile image loaded successfully in navbar')}
                />
              ) : null}
              {!user?.profile_picture && (
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{getUserInitials()}</span>
              )}
              {user?.profile_picture && (
                <span style={{ fontSize: '14px', fontWeight: '600', display: 'none' }}>{getUserInitials()}</span>
              )}
            </span>
            <span className="d-none d-sm-inline">{getUserFullName()}</span>
            <i className="bi bi-caret-down-fill small" />
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li><h6 className="dropdown-header">{getUserFullName()}</h6></li>
            <li><small className="dropdown-item-text text-muted">{user?.email}</small></li>
            <li><hr className="dropdown-divider" /></li>
            <li><button className="dropdown-item" type="button">My Profile</button></li>
            <li><button className="dropdown-item" type="button">Settings</button></li>
            <li><hr className="dropdown-divider" /></li>
            <li><button className="dropdown-item text-danger" type="button" onClick={handleLogout}>Logout</button></li>
          </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Topbar