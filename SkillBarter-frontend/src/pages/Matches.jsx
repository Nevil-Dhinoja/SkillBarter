import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'

function Matches({ onStartChat }) {
  const { token, user } = useAuth()
  const { sendFriendRequestNotification, sendFriendAcceptedNotification } = useSocket()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [query, setQuery] = useState('')
  const [friendshipStatuses, setFriendshipStatuses] = useState({})
  const [requestingFriends, setRequestingFriends] = useState(new Set())

  // Filter users based on search query
  const filteredUsers = users.filter((user) => 
    user.full_name.toLowerCase().includes(query.toLowerCase()) ||
    user.skillsToTeach.some(skill => skill.toLowerCase().includes(query.toLowerCase())) ||
    user.skillsToLearn.some(skill => skill.toLowerCase().includes(query.toLowerCase()))
  )

  // Load all users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  // Load friendship statuses when users change
  useEffect(() => {
    if (users.length > 0) {
      loadFriendshipStatuses()
    }
  }, [users])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('http://localhost:5000/api/users/all', { 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.data)
      } else {
        setError(data.message || 'Failed to load users')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Failed to load users:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadFriendshipStatuses = async () => {
    try {
      const statuses = {}
      for (const userItem of users) {
        const response = await fetch(`http://localhost:5000/api/friends/status/${userItem.user_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        const data = await response.json()
        if (data.success) {
          statuses[userItem.user_id] = data.data.status
        }
      }
      setFriendshipStatuses(statuses)
    } catch (err) {
      console.error('Failed to load friendship statuses:', err)
    }
  }

  const sendFriendRequest = async (receiverId, receiverName) => {
    try {
      setRequestingFriends(prev => new Set([...prev, receiverId]))
      
      const response = await fetch('http://localhost:5000/api/friends/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiver_id: receiverId,
          message: `Hi ${receiverName}, I'd like to connect with you for skill exchange!`
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Update friendship status
        setFriendshipStatuses(prev => ({
          ...prev,
          [receiverId]: 'pending_sent'
        }))
        
        // Send real-time notification
        sendFriendRequestNotification(receiverId, user.full_name)
        
        // Show success message
        setError('')
        setSuccessMessage(`✅ Friend request sent to ${receiverName}!`)
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('')
        }, 3000)
      } else {
        setError(data.message || 'Failed to send friend request')
        setSuccessMessage('')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setSuccessMessage('')
      console.error('Failed to send friend request:', err)
    } finally {
      setRequestingFriends(prev => {
        const newSet = new Set(prev)
        newSet.delete(receiverId)
        return newSet
      })
    }
  }

  const acceptFriendRequest = async (senderId, senderName) => {
    try {
      setRequestingFriends(prev => new Set([...prev, senderId]))
      
      // Find the request ID from friendship statuses (if available)
      const response = await fetch(`http://localhost:5000/api/friends/status/${senderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const statusData = await response.json()
      let requestId = null
      
      if (statusData.success && statusData.data.request_id) {
        requestId = statusData.data.request_id
      }
      
      if (!requestId) {
        setError('Friend request not found')
        return
      }
      
      const acceptResponse = await fetch(`http://localhost:5000/api/friends/request/${requestId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const acceptData = await acceptResponse.json()
      
      if (acceptData.success) {
        // Update friendship status to accepted
        setFriendshipStatuses(prev => ({
          ...prev,
          [senderId]: 'accepted'
        }))
        
        // Send real-time notification to both users
        sendFriendAcceptedNotification(
          senderId,
          user.user_id,
          senderName,
          user.full_name
        )
        
        // Show success message
        setError('')
        setSuccessMessage(`✅ You are now friends with ${senderName}! You can start chatting.`)
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('')
        }, 5000)
        
      } else {
        setError(acceptData.message || 'Failed to accept friend request')
        setSuccessMessage('')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setSuccessMessage('')
      console.error('Failed to accept friend request:', err)
    } finally {
      setRequestingFriends(prev => {
        const newSet = new Set(prev)
        newSet.delete(senderId)
        return newSet
      })
    }
  }

  const getFriendshipButtonContent = (userItem) => {
    const status = friendshipStatuses[userItem.user_id]
    const isRequesting = requestingFriends.has(userItem.user_id)
    
    if (isRequesting) {
      return {
        text: 'Sending...',
        className: 'btn btn-outline-secondary btn-sm',
        disabled: true,
        onClick: null
      }
    }
    
    switch (status) {
      case 'accepted':
        return {
          text: '💬 Start Chat',
          className: 'btn btn-success btn-sm',
          disabled: false,
          onClick: () => onStartChat && onStartChat(userItem)
        }
      case 'pending_sent':
        return {
          text: 'Request Sent',
          className: 'btn btn-outline-warning btn-sm',
          disabled: true,
          onClick: null
        }
      case 'pending_received':
        return {
          text: 'Accept Request',
          className: 'btn btn-outline-info btn-sm',
          disabled: false,
          onClick: () => acceptFriendRequest(userItem.user_id, userItem.full_name)
        }
      default:
        return {
          text: '➕ Add Friend',
          className: 'btn btn-outline-primary btn-sm',
          disabled: false,
          onClick: () => sendFriendRequest(userItem.user_id, userItem.full_name)
        }
    }
  }

  return (
    <div className="p-4 p-md-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5 mb-0">Discover Users</h2>
        <input 
          className="form-control" 
          style={{ maxWidth: 280 }} 
          placeholder="Search users, skills..." 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
        />
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading users...</p>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button 
            className="btn btn-outline-danger btn-sm ms-2" 
            onClick={loadUsers}
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Success State */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible" role="alert">
          {successMessage}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccessMessage('')}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      {/* Users Grid */}
      {!loading && !error && (
        <>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted mb-3">
                {query ? `No users found matching "${query}"` : 'No users found on the platform yet.'}
              </p>
              {query && (
                <button 
                  className="btn btn-outline-secondary" 
                  onClick={() => setQuery('')}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-3 text-muted small">
                Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                {query && ` matching "${query}"`}
              </div>
              
              <div className="row g-3">
                {filteredUsers.map((user) => (
                  <div className="col-12 col-md-6 col-xl-4" key={user.user_id}>
                    <div className="card h-100 shadow-sm border-0">
                      <div className="card-body">
                        <div>
                          <div className="fw-semibold mb-1">{user.full_name}</div>
                          {user.location && (
                            <div className="text-muted small mb-2">
                              <i className="bi bi-geo-alt me-1"></i>
                              {user.location}
                            </div>
                          )}
                          <div className="small text-secondary mb-2">
                            {user.skillsToTeach.length > 0 && (
                              <span>
                                <strong>Teaches:</strong> {user.skillsToTeach.slice(0, 3).join(', ')}
                                {user.skillsToTeach.length > 3 && ` +${user.skillsToTeach.length - 3} more`}
                              </span>
                            )}
                            {user.skillsToTeach.length > 0 && user.skillsToLearn.length > 0 && <br />}
                            {user.skillsToLearn.length > 0 && (
                              <span>
                                <strong>Learning:</strong> {user.skillsToLearn.slice(0, 3).join(', ')}
                                {user.skillsToLearn.length > 3 && ` +${user.skillsToLearn.length - 3} more`}
                              </span>
                            )}
                            {user.skillsToTeach.length === 0 && user.skillsToLearn.length === 0 && (
                              <span className="text-muted fst-italic">No skills added yet</span>
                            )}
                          </div>
                          <button 
                            className={getFriendshipButtonContent(user).className}
                            onClick={getFriendshipButtonContent(user).onClick}
                            disabled={getFriendshipButtonContent(user).disabled}
                          >
                            {getFriendshipButtonContent(user).text}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Matches


