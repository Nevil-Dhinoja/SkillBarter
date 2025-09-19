import React from 'react'
import { useSocket } from '../context/SocketContext'

function NotificationToast() {
  const { notifications, removeNotification } = useSocket()

  // Auto-dismiss notifications after 5 seconds
  React.useEffect(() => {
    notifications.forEach(notification => {
      const timer = setTimeout(() => {
        removeNotification(notification.id)
      }, 5000)
      
      return () => clearTimeout(timer)
    })
  }, [notifications, removeNotification])

  if (notifications.length === 0) return null

  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
      {/* Show notification count badge if more than 3 notifications */}
      {notifications.length > 3 && (
        <div className="alert alert-info alert-dismissible mb-2" role="alert">
          <strong>📢 {notifications.length} new notifications</strong>
          <button
            type="button"
            className="btn-close"
            onClick={() => {
              // Keep only the latest 3
              const latestNotifications = notifications.slice(0, 3)
              notifications.slice(3).forEach(notif => removeNotification(notif.id))
            }}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      {notifications.slice(0, 3).map((notification) => (
        <div
          key={notification.id}
          className={`toast show mb-2 ${
            notification.type === 'message' ? 'bg-primary text-white' :
            notification.type === 'friend_request' ? 'bg-info text-white' :
            notification.type === 'friend_accepted' ? 'bg-success text-white' :
            notification.type === 'friend_accepted_success' ? 'bg-success text-white' :
            'bg-secondary text-white'
          }`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="toast-header">
            <strong className="me-auto">
              {notification.type === 'message' && '💬 New Message'}
              {notification.type === 'friend_request' && '👥 Friend Request'}
              {notification.type === 'friend_accepted' && '✅ Friend Accepted'}
              {notification.type === 'friend_accepted_success' && '🎉 New Friend'}
            </strong>
            <small className="text-muted">
              {new Date(notification.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </small>
            <button
              type="button"
              className="btn-close"
              onClick={() => removeNotification(notification.id)}
              aria-label="Close"
            ></button>
          </div>
          <div className="toast-body">
            {notification.message}
            {notification.type === 'message' && notification.data?.message && (
              <div className="small mt-1 opacity-75">
                "{notification.data.message}"
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationToast