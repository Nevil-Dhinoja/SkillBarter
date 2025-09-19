import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth()
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [notifications, setNotifications] = useState([])
  const socketRef = useRef(null)
  const userIdRef = useRef(null)

  useEffect(() => {
    const isAuth = isAuthenticated()
    const currentUserId = user?.user_id
    
    // Clean up existing socket if user changes or logs out
    if (socketRef.current && (!isAuth || !currentUserId || userIdRef.current !== currentUserId)) {
      console.log('🧹 Cleaning up existing socket for user change/logout')
      socketRef.current.removeAllListeners()
      socketRef.current.close()
      socketRef.current = null
      userIdRef.current = null
      setSocket(null)
      setConnected(false)
      setNotifications([]) // Clear notifications on logout
    }
    
    // Only initialize if authenticated, has user ID, and no existing socket
    if (isAuth && currentUserId && !socketRef.current) {
      console.log('🔌 Initializing socket connection for user:', currentUserId)
      
      userIdRef.current = currentUserId
      
      // Initialize socket connection
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        forceNew: true
      })

      newSocket.on('connect', () => {
        console.log('🔗 Connected to server')
        setConnected(true)
        
        // Join with user ID
        newSocket.emit('join', currentUserId)
      })

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from server:', reason)
        setConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setConnected(false)
      })

      // Listen for real-time messages to show notifications
      newSocket.on('receive_message', (data) => {
        console.log('📨 Message received:', data)
        addNotification({
          type: 'message',
          message: `New message from ${data.senderName || 'Unknown'}`,
          data: data
        })
      })

      // Listen for real-time messages
      newSocket.on('receive_message', (data) => {
        console.log('📨 Message received in SocketContext:', data)
        const { senderId, senderName, message, timestamp, messageId } = data
        
        // Add notification for new message
        addNotification({
          type: 'message',
          message: `New message from ${senderName || 'Unknown User'}`,
          data: {
            senderId,
            senderName,
            message: message.length > 50 ? message.substring(0, 50) + '...' : message,
            timestamp,
            messageId // Include messageId for deduplication
          }
        })
      })
      
      // Listen for friend request notifications
      newSocket.on('friend_request_received', (data) => {
        console.log('📨 Friend request received:', data)
        addNotification({
          type: 'friend_request',
          message: `${data.senderName} sent you a friend request`,
          data: data
        })
      })

      // Listen for friend request acceptance notifications
      newSocket.on('friend_request_was_accepted', (data) => {
        console.log('✅ Your friend request was accepted:', data)
        addNotification({
          type: 'friend_accepted',
          message: `${data.acceptedByName} accepted your friend request!`,
          data: data
        })
      })

      newSocket.on('friend_request_accepted_success', (data) => {
        console.log('✅ Successfully accepted friend request:', data)
        addNotification({
          type: 'friend_accepted_success',
          message: `You are now friends with ${data.friendName}!`,
          data: data
        })
      })

      // Listen for quiz assignment notifications
      newSocket.on('quiz_assigned', (data) => {
        console.log('📚 Quiz assigned:', data)
        addNotification({
          type: 'quiz_assigned',
          message: `${data.assignerName} assigned you a ${data.quizTitle} quiz`,
          data: data
        })
      })

      socketRef.current = newSocket
      setSocket(newSocket)
    } else if (!isAuth || !currentUserId) {
      // Close socket if user is not authenticated
      if (socketRef.current) {
        console.log('🔒 Closing socket - user not authenticated')
        socketRef.current.removeAllListeners()
        socketRef.current.close()
        socketRef.current = null
        userIdRef.current = null
        setSocket(null)
        setConnected(false)
        setNotifications([]) // Clear notifications on logout
      }
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        console.log('🧹 Cleaning up socket connection on unmount')
        socketRef.current.removeAllListeners()
        socketRef.current.close()
        socketRef.current = null
        userIdRef.current = null
      }
    }
  }, [isAuthenticated, user?.user_id, token]) // Include token dependency to trigger on login/logout

  const sendMessage = (receiverId, message) => {
    if (socket && connected) {
      socket.emit('send_message', {
        receiverId,
        message,
        senderId: user.user_id
      })
    }
  }

  const sendFriendRequestNotification = (receiverId, senderName) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('send_friend_request', {
        receiverId,
        senderName
      })
    }
  }

  const sendFriendAcceptedNotification = (senderId, receiverId, senderName, receiverName) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('friend_request_accepted', {
        senderId,
        receiverId,
        senderName,
        receiverName
      })
    }
  }

  const sendQuizAssignmentNotification = (receiverId, assignerName, quizTitle) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('send_quiz_assignment', {
        receiverId,
        assignerName,
        quizTitle
      })
    }
  }

  const addNotification = (notification) => {
    const notificationWithId = {
      ...notification,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString()
    }
    
    // Prevent duplicate notifications by checking if a similar notification already exists
    setNotifications(prev => {
      const isDuplicate = prev.some(existing => 
        existing.type === notification.type &&
        existing.data?.senderId === notification.data?.senderId &&
        existing.data?.messageId === notification.data?.messageId &&
        existing.data?.message === notification.data?.message
      )
      
      if (isDuplicate) {
        console.log('⚠️ Duplicate notification prevented:', notification)
        return prev
      }
      
      console.log('✅ Adding new notification:', notification)
      return [notificationWithId, ...prev.slice(0, 9)] // Keep only 10 latest
    })
    
    // Play notification sound for messages and friend requests
    if (notification.type === 'message' || notification.type === 'friend_request' || notification.type === 'quiz_assigned') {
      try {
        // Create a pleasant notification sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        const filter = audioContext.createBiquadFilter()
        
        // Connect audio nodes
        oscillator.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        // Configure the sound
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.1)
        
        // Add a low-pass filter for smoother sound
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(2000, audioContext.currentTime)
        
        // Configure volume envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
        
        // Play the sound
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.4)
      } catch (e) {
        console.log('Could not create notification sound:', e)
        
        // Fallback: try to use a simple beep
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+L3vnUhATJ+zfPTgjMGHm+56Z9eExE=')
          audio.volume = 0.2
          audio.play().catch(() => {}) // Silent fail if audio doesn't work
        } catch (fallbackError) {
          // Silent fail if both methods don't work
        }
      }
    }
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const value = {
    socket,
    connected,
    onlineUsers,
    notifications,
    sendMessage,
    sendFriendRequestNotification,
    sendFriendAcceptedNotification,
    sendQuizAssignmentNotification,
    addNotification,
    removeNotification,
    clearNotifications
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}