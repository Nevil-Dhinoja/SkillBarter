import React, { useMemo, useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'

const MOCK_THREADS = [
  {
    id: 't1',
    user: { id: '1', name: 'Ava Carter', avatar: 'https://i.pravatar.cc/80?img=32' },
    messages: [
      { id: 'm1', fromMe: false, text: 'Hey there! I can help with Photoshop.', at: '10:01' },
      { id: 'm2', fromMe: true, text: 'Awesome! I can share Python tips too.', at: '10:02' },
    ],
  },
  {
    id: 't2',
    user: { id: '2', name: 'Noah Singh', avatar: 'https://i.pravatar.cc/80?img=12' },
    messages: [
      { id: 'n1', fromMe: false, text: 'Want to jam sometime?', at: '9:30' },
    ],
  },
]

function Chat({ initialUser, onBackToMatches }) {
  const { user, token } = useAuth()
  const { socket, sendMessage } = useSocket()
  const [friends, setFriends] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [draft, setDraft] = useState('')
  const [conversations, setConversations] = useState({})
  const [loading, setLoading] = useState(true)

  // Load friends on component mount
  useEffect(() => {
    loadFriends()
  }, [])

  // Set initial active conversation if initialUser is provided
  useEffect(() => {
    if (initialUser && friends.length > 0) {
      const friend = friends.find(f => f.user_id === initialUser.user_id)
      if (friend) {
        setActiveId(friend.user_id)
      } else if (friends.length > 0) {
        setActiveId(friends[0].user_id)
      }
    } else if (friends.length > 0 && !activeId) {
      setActiveId(friends[0].user_id)
    }
  }, [initialUser, friends])

  // Load conversation when activeId changes
  useEffect(() => {
    if (activeId) {
      loadConversation(activeId)
    }
  }, [activeId])

  // Listen for real-time messages
  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (data) => {
        const { senderId, senderName, message, timestamp, messageId } = data
        const newMessage = {
          id: messageId ? messageId.toString() : Date.now().toString(),
          fromMe: false,
          text: message,
          at: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: timestamp,
          senderName: senderName
        }
        
        setConversations(prev => ({
          ...prev,
          [senderId]: [
            ...(prev[senderId] || []),
            newMessage
          ]
        }))
      }

      const handleMessageSent = (data) => {
        const { receiverId, message, timestamp, messageId } = data
        const newMessage = {
          id: messageId ? messageId.toString() : Date.now().toString(),
          fromMe: true,
          text: message,
          at: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: timestamp
        }
        
        setConversations(prev => ({
          ...prev,
          [receiverId]: [
            ...(prev[receiverId] || []),
            newMessage
          ]
        }))
      }

      socket.on('receive_message', handleReceiveMessage)
      socket.on('message_sent', handleMessageSent)

      return () => {
        socket.off('receive_message', handleReceiveMessage)
        socket.off('message_sent', handleMessageSent)
      }
    }
  }, [socket])

  const loadFriends = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/friends/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setFriends(data.data)
      } else {
        console.error('Failed to load friends:', data.message)
      }
    } catch (err) {
      console.error('Failed to load friends:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadConversation = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/conversation/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setConversations(prev => ({
          ...prev,
          [userId]: data.data
        }))
      } else {
        console.error('Failed to load conversation:', data.message)
        // Initialize empty conversation if none exists
        setConversations(prev => ({
          ...prev,
          [userId]: []
        }))
      }
    } catch (err) {
      console.error('Failed to load conversation:', err)
      // Initialize empty conversation on error
      setConversations(prev => ({
        ...prev,
        [userId]: []
      }))
    }
  }

  const activeFriend = useMemo(() => {
    return friends.find(f => f.user_id === activeId)
  }, [friends, activeId])

  const activeMessages = useMemo(() => {
    return conversations[activeId] || []
  }, [conversations, activeId])

  const send = () => {
    const text = draft.trim()
    if (!text || !activeId) return
    
    // Send message via Socket.IO
    sendMessage(activeId, text)
    
    setDraft('')
  }

  return (
    <div className="p-0 p-md-4 h-100">
      {/* Back to Matches button */}
      {onBackToMatches && (
        <div className="p-3 border-bottom">
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={onBackToMatches}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Discover Users
          </button>
        </div>
      )}
      
      <div className="card shadow-sm border-0" style={{ minHeight: '60vh' }}>
        <div className="row g-0">
          {/* Left: conversations */}
          <div className="col-12 col-md-4 border-end">
            <div className="p-3 border-bottom fw-semibold d-flex align-items-center justify-content-between">
              <span>Conversations</span>
              {onBackToMatches && (
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={onBackToMatches}
                  title="Back to Discover Users"
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Back
                </button>
              )}
            </div>
            {loading ? (
              <div className="p-3 text-center">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted small">Loading friends...</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="p-3 text-center text-muted">
                <i className="bi bi-people d-block mb-2" style={{ fontSize: '2rem' }}></i>
                <p className="small">No friends yet. Add friends from the Discover Users page to start chatting!</p>
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {friends.map((friend) => (
                  <button
                    key={friend.user_id}
                    type="button"
                    className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeId === friend.user_id ? 'active' : ''}`}
                    onClick={() => setActiveId(friend.user_id)}
                  >
                    <div 
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        fontSize: '14px', 
                        fontWeight: '600'
                      }}
                    >
                      {friend.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span>{friend.full_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: chat window */}
          <div className="col-12 col-md-8 d-flex flex-column">
            {activeFriend ? (
              <>
                <div className="p-3 border-bottom d-flex align-items-center gap-2">
                  <div 
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      fontSize: '14px', 
                      fontWeight: '600'
                    }}
                  >
                    {activeFriend.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="fw-semibold">{activeFriend.full_name}</div>
                </div>

                <div className="flex-grow-1 p-3 overflow-auto" style={{ maxHeight: '50vh' }}>
                  {activeMessages.length === 0 ? (
                    <div className="text-center text-muted p-4">
                      <i className="bi bi-chat-dots d-block mb-2" style={{ fontSize: '2rem' }}></i>
                      <p>Start a conversation with {activeFriend.full_name}!</p>
                    </div>
                  ) : (
                    activeMessages.map((m) => (
                      <div key={m.id} className={`d-flex ${m.fromMe ? 'justify-content-end' : 'justify-content-start'} mb-2`}>
                        <div className={`px-3 py-2 rounded-3 shadow-sm ${m.fromMe ? 'bg-primary text-white' : 'bg-body-secondary'}`}>
                          {m.text}
                          <div className={`small mt-1 ${m.fromMe ? 'text-white-50' : 'text-muted'}`}>{m.at}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 border-top d-flex gap-2">
                  <input 
                    className="form-control" 
                    placeholder="Type a message" 
                    value={draft} 
                    onChange={(e) => setDraft(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter') send() }}
                    disabled={!activeFriend}
                  />
                  <button className="btn btn-primary" onClick={send} disabled={!activeFriend}>
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                <div className="text-center">
                  <i className="bi bi-chat-square d-block mb-2" style={{ fontSize: '3rem' }}></i>
                  <p>Select a friend to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat


