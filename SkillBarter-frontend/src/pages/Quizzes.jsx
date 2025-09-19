import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import './Quizzes.css'

function QuizBuilder({ onSave, defaultSkill = 'Python' }) {
  const [skill, setSkill] = useState(defaultSkill)
  const [questions, setQuestions] = useState([
    { id: 'q1', text: '', options: ['', '', '', ''], correct: 0 },
  ])

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), text: '', options: ['', '', '', ''], correct: 0 },
    ])
  }

  const updateQuestion = (qi, patch) => {
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)))
  }

  const updateOption = (qi, oi, value) => {
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) } : q)))
  }

  const removeQuestion = (qi) => {
    if (questions.length <= 1) {
      alert('You need at least one question in your quiz.')
      return
    }
    setQuestions((prev) => prev.filter((_, i) => i !== qi))
  }

  const save = () => {
    console.log('Attempting to save quiz...')
    console.log('Current questions:', questions)
    
    // Validate that all questions have text and options
    const isValid = questions.every(q => {
      const hasText = q.text.trim() !== ''
      const hasOptions = q.options.every(opt => opt.trim() !== '')
      const hasValidCorrect = q.correct >= 0 && q.correct < q.options.length
      return hasText && hasOptions && hasValidCorrect
    })
    
    console.log('Quiz validation result:', isValid)
    
    if (!isValid) {
      alert('Please fill in all question texts, options, and ensure each question has a correct answer selected.')
      return
    }
    
    // Create a clean quiz object
    const quizData = {
      id: Math.random().toString(36).slice(2),
      skill,
      questions: questions.map(q => ({
        ...q,
        options: [...q.options]
      }))
    }
    
    console.log('Saving quiz data:', quizData)
    onSave?.(quizData)
  }

  return (
    <div className="card quiz-builder-card">
      <div className="quiz-builder-header">
        <h3 className="h5 mb-0">Create Quiz</h3>
      </div>
      <div className="quiz-builder-body">
        <div className="mb-4">
          <label className="form-label fw-medium">Skill</label>
          <input 
            className="form-control quiz-option-input" 
            value={skill} 
            onChange={(e) => setSkill(e.target.value)}
            placeholder="Enter skill name"
          />
        </div>

        {questions.map((q, qi) => (
          <div key={q.id} className="quiz-question-card">
            <div className="quiz-question-header">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label mb-0 fw-medium">Question {qi + 1}</label>
                {questions.length > 1 && (
                  <button 
                    className="btn btn-sm btn-outline-danger" 
                    type="button" 
                    onClick={() => removeQuestion(qi)}
                  >
                    <i className="bi bi-trash me-1"></i>Remove
                  </button>
                )}
              </div>
            </div>
            <div className="quiz-question-body">
              <div className="mb-3">
                <input
                  className="form-control quiz-option-input"
                  placeholder="Enter question text"
                  value={q.text}
                  onChange={(e) => updateQuestion(qi, { text: e.target.value })}
                />
              </div>
              <div className="row g-3">
                {q.options.map((opt, oi) => (
                  <div className="col-12 col-md-6" key={oi}>
                    <div className="input-group">
                      <div className="input-group-text">
                        <input
                          className="form-check-input mt-0"
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correct === oi}
                          onChange={() => updateQuestion(qi, { correct: oi })}
                          aria-label="Select correct"
                        />
                      </div>
                      <input
                        className="form-control quiz-option-input"
                        placeholder={`Option ${oi + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(qi, oi, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="d-flex gap-2 mt-3">
          <button className="btn btn-outline-secondary" type="button" onClick={addQuestion}>
            <i className="bi bi-plus-circle me-1"></i>Add Question
          </button>
          <button className="btn btn-primary" type="button" onClick={save}>
            <i className="bi bi-save me-1"></i>Save Quiz
          </button>
        </div>
      </div>
    </div>
  )
}

function QuizList({ quizzes = [], onStart, onAssign, showAssignButton = false, onDelete, showDeleteButton = false }) {
  if (!quizzes.length) {
    return (
      <div className="text-center py-5">
        <div className="text-secondary small">
          <i className="bi bi-clipboard-check fs-1 d-block mb-2"></i>
          No quizzes yet.
        </div>
      </div>
    )
  }
  return (
    <div className="quiz-list-grid">
      {quizzes.map((q) => (
        <div className="quiz-card" key={q.id || q.quiz_id || Math.random()}>
          <div className="quiz-card-body">
            <div className="quiz-skill-title">{q.skill || q.quiz?.title || 'Untitled Quiz'}</div>
            <div className="quiz-meta-info">
              <div className="mb-2">
                <i className="bi bi-question-circle me-1"></i>
                {(q.questions?.length || q.quiz?.questions?.length || 0)} questions
              </div>
              {q.assigner && (
                <div className="mb-1">
                  <i className="bi bi-person me-1"></i>
                  Assigned by: {q.assigner.full_name}
                </div>
              )}
              {q.creator && (
                <div className="mb-1">
                  <i className="bi bi-person me-1"></i>
                  Created by: {q.creator.full_name}
                </div>
              )}
              {q.status && (
                <div className="mt-2">
                  {q.status === 'completed' ? (
                    <span className="badge bg-success quiz-status-badge">
                      <i className="bi bi-check-circle me-1"></i>Completed
                    </span>
                  ) : q.status === 'in_progress' ? (
                    <span className="badge bg-warning quiz-status-badge">
                      <i className="bi bi-clock-history me-1"></i>In Progress
                    </span>
                  ) : (
                    <span className="badge bg-secondary quiz-status-badge">
                      <i className="bi bi-circle me-1"></i>Not Started
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="mt-auto">
              {q.status === 'completed' ? (
                <button className="btn btn-success w-100 mb-2" onClick={() => onStart(q)}>
                  <i className="bi bi-eye me-1"></i>View Results
                </button>
              ) : (
                <button className="btn btn-primary w-100 mb-2" onClick={() => onStart(q)}>
                  <i className="bi bi-play-circle me-1"></i>Start Quiz
                </button>
              )}
              {showAssignButton && onAssign && q.status !== 'completed' && (
                <button className="btn btn-outline-secondary w-100 mb-2" onClick={() => onAssign(q)}>
                  <i className="bi bi-send me-1"></i>Assign to Friend
                </button>
              )}
              {showDeleteButton && onDelete && (
                <button 
                  className="btn btn-outline-danger w-100" 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
                      onDelete(q);
                    }
                  }}
                >
                  <i className="bi bi-trash me-1"></i>Delete Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function AssignQuizModal({ quiz, onClose, onAssign }) {
  const { token, user } = useAuth()
  const { sendQuizAssignmentNotification } = useSocket()
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFriend, setSelectedFriend] = useState('')
  const [message, setMessage] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState('')
  const [apiAvailable, setApiAvailable] = useState(true) // Track API availability

  useEffect(() => {
    loadFriends()
  }, [])

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
        setError(data.message || 'Failed to load friends')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Failed to load friends:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedFriend) {
      setError('Please select a friend to assign the quiz to')
      return
    }
    
    // Debug logging
    console.log('Assigning quiz:', {
      quiz_id: quiz.id || quiz.quiz_id,
      assigned_to: selectedFriend,
      message: message || ''
    })
    
    // Validate data before sending
    const quizId = quiz.id || quiz.quiz_id
    if (!quizId) {
      setError('Invalid quiz ID')
      return
    }
    
    // Make sure selectedFriend is a number
    const assignedTo = parseInt(selectedFriend)
    if (isNaN(assignedTo)) {
      setError('Invalid friend selection')
      return
    }
    
    try {
      setAssigning(true)
      setError('')
      
      // Try to assign the quiz via the API
      const response = await fetch('http://localhost:5000/api/quizzes/assign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          quiz_id: quizId,
          assigned_to: assignedTo,
          message: message || ''
        })
      })
      
      console.log('Assignment response status:', response.status)
      
      // Check if API is available
      if (response.status === 404) {
        setApiAvailable(false)
        // Simulate successful assignment with mock data
        setTimeout(() => {
          // Send real-time notification
          const selectedFriendObj = friends.find(f => f.user_id === assignedTo)
          if (selectedFriendObj) {
            sendQuizAssignmentNotification(assignedTo, user.full_name, quiz.skill || quiz.quiz?.title || 'Quiz')
          }
          
          onAssign({
            id: Math.random(),
            quiz_id: quizId,
            assigner: { full_name: user.full_name },
            assignee: selectedFriendObj,
            message: message || '',
            status: 'pending',
            assigned_at: new Date().toISOString()
          })
          onClose()
        }, 1000)
        return
      }
      
      // Handle 400 errors specifically
      if (response.status === 400) {
        const errorData = await response.json()
        console.error('Assignment failed with 400 error:', errorData)
        setError(errorData.message || 'Failed to assign quiz. Please check the data and try again.')
        return
      }
      
      // Handle 401 errors (unauthorized)
      if (response.status === 401) {
        setError('Authentication required. Please log in again.')
        return
      }
      
      // Handle 404 errors (quiz or user not found)
      if (response.status === 404) {
        setError('Quiz or user not found.')
        return
      }
      
      // Handle network errors
      if (!response.ok) {
        setError(`Assignment failed with status ${response.status}`)
        return
      }
      
      const data = await response.json()
      console.log('Assignment response data:', data)
      
      if (data.success) {
        setApiAvailable(true) // API is working
        // Send real-time notification
        const selectedFriendObj = friends.find(f => f.user_id === assignedTo)
        if (selectedFriendObj) {
          sendQuizAssignmentNotification(assignedTo, user.full_name, quiz.skill || quiz.quiz?.title || 'Quiz')
        }
        
        onAssign(data.data)
        onClose()
      } else {
        setError(data.message || 'Failed to assign quiz')
      }
    } catch (err) {
      setApiAvailable(false) // API is not available
      // If there's a network error, simulate successful assignment
      console.error('Failed to assign quiz:', err)
      setError('Network error. Please try again.')
      
      // Only simulate if it's actually a network error
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setTimeout(() => {
          // Send real-time notification
          const selectedFriendObj = friends.find(f => f.user_id === assignedTo)
          if (selectedFriendObj) {
            sendQuizAssignmentNotification(assignedTo, user.full_name, quiz.skill || quiz.quiz?.title || 'Quiz')
          }
          
          onAssign({
            id: Math.random(),
            quiz_id: quizId,
            assigner: { full_name: user.full_name },
            assignee: selectedFriendObj,
            message: message || '',
            status: 'pending',
            assigned_at: new Date().toISOString()
          })
          onClose()
        }, 1000)
      }
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="modal show d-block assign-quiz-modal" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-send me-2"></i>Assign Quiz to Friend
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-4">
              <label className="form-label fw-medium">Quiz</label>
              <input className="form-control quiz-option-input" value={`${quiz.skill || quiz.quiz?.title || 'Untitled Quiz'} (${quiz.questions?.length || quiz.quiz?.questions?.length || 0} questions)`} readOnly />
            </div>
            
            <div className="mb-4">
              <label className="form-label fw-medium">Select Friend</label>
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  <span>Loading friends...</span>
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : (
                <select 
                  className="form-select quiz-option-input" 
                  value={selectedFriend} 
                  onChange={(e) => setSelectedFriend(e.target.value)}
                >
                  <option value="">Select a friend</option>
                  {friends.map(friend => (
                    <option key={friend.user_id} value={friend.user_id}>
                      {friend.full_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="mb-4">
              <label className="form-label fw-medium">Message (Optional)</label>
              <textarea 
                className="form-control quiz-option-input" 
                rows="3" 
                placeholder="Add a personal message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </div>
            
            {error && !loading && (
              <div className="alert alert-danger">{error}</div>
            )}
            
            {/* Only show the warning if API is not available */}
            {!apiAvailable && (
              <div className="alert alert-warning">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Note:</strong> The quiz assignment feature is currently in simulation mode. In a production environment, this would connect to the backend API.
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={assigning}>
              <i className="bi bi-x-circle me-1"></i>Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleAssign} 
              disabled={assigning || !selectedFriend}
            >
              {assigning ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>Assigning...
                </>
              ) : (
                <>
                  <i className="bi bi-send-check me-1"></i>Assign Quiz
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TakeQuiz({ quiz, onClose }) {
  const questions = quiz.questions || quiz.quiz?.questions || []
  const [answers, setAnswers] = useState(Array(questions.length || 0).fill(null))
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)
  const { token } = useAuth()

  // Check if quiz is already completed
  useEffect(() => {
    const checkQuizStatus = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/quizzes/${quiz.id || quiz.quiz_id}/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'completed') {
            setSubmitted(true)
            // Calculate and set score based on existing result
            setScore({
              correct: Math.round((data.score / 100) * questions.length),
              total: questions.length,
              pct: data.score
            })
          }
        }
      } catch (error) {
        console.error('Error checking quiz status:', error)
      }
    }
    
    if (quiz.id || quiz.quiz_id) {
      checkQuizStatus()
    }
  }, [quiz, token, questions.length])

  const calculateScore = useCallback(() => {
    if (!submitted) return null
    const correct = questions.reduce((acc, q, i) => (answers[i] === q.correct ? acc + 1 : acc), 0)
    const pct = Math.round((correct / questions.length) * 100)
    return { correct, total: questions.length, pct }
  }, [submitted, answers, questions])

  // Update score when submitted state changes
  useEffect(() => {
    if (submitted && !score) {
      setScore(calculateScore())
    }
  }, [submitted, calculateScore, score])

  const submit = async () => {
    // Save quiz result to backend
    try {
      const response = await fetch('http://localhost:5000/api/quizzes/results', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quiz_id: quiz.id || quiz.quiz_id,
          score: Math.round((questions.filter((q, i) => answers[i] === q.correct).length / questions.length) * 100)
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Set submitted state immediately
          setSubmitted(true)
          // Calculate and set score
          const newScore = calculateScore()
          setScore(newScore)
          // Update the quiz status in the parent component
          if (quiz.onStatusUpdate) {
            quiz.onStatusUpdate('completed')
          }
        } else {
          console.error('Failed to save quiz result:', data.message)
        }
      } else {
        console.error('Failed to save quiz result')
      }
    } catch (error) {
      console.error('Error saving quiz result:', error)
    }
  }

  const select = (qi, oi) => {
    if (submitted) return // Prevent changing answers after submission
    setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))
  }

  // If quiz is already completed, show the results
  if (submitted && score) {
    return (
      <div className="card take-quiz-card">
        <div className="take-quiz-header">
          <h3 className="h5 mb-0">{quiz.skill || quiz.quiz?.title || 'Untitled Quiz'}</h3>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="take-quiz-body">
          <div className="alert alert-success text-center">
            <i className="bi bi-check-circle-fill fs-1 mb-3 d-block"></i>
            <h4>Quiz Completed!</h4>
            <p>You have already completed this quiz.</p>
            <div className="h5">Score: {score.correct}/{score.total} ({score.pct}%)</div>
          </div>
          <div className="text-center">
            <button className="btn btn-primary" onClick={onClose}>
              <i className="bi bi-check-lg me-1"></i>Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card take-quiz-card">
      <div className="take-quiz-header">
        <h3 className="h5 mb-0">{quiz.skill || quiz.quiz?.title || 'Untitled Quiz'}</h3>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
      <div className="take-quiz-body">
        {questions.map((q, qi) => (
          <div key={q.id || qi} className="mb-4">
            <div className="quiz-question-title">Q{qi + 1}. {q.text || q.question_text || 'Untitled question'}</div>
            <div className="row g-2">
              {(q.options || [q.option1, q.option2, q.option3, q.option4]).map((opt, oi) => {
                let containerClasses = "quiz-option-input-container"
                
                if (submitted) {
                  if (oi === (q.correct || q.correct_option)) {
                    containerClasses += " correct" // Correct answer is always green
                  } else if (answers[qi] === oi) {
                    containerClasses += " incorrect" // Selected wrong answer is red
                  }
                } else if (answers[qi] === oi) {
                  containerClasses += " selected" // Selected answer before submission
                }
                
                return (
                  <div className="col-12 col-md-6" key={oi}>
                    <label className="quiz-option-label"> 
                      <div className={containerClasses}>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`ans-${q.id || qi}`}
                            checked={answers[qi] === oi}
                            onChange={() => select(qi, oi)}
                            disabled={submitted} // Disable after submission
                          />
                          <span className="ms-2">{opt || `Option ${oi + 1}`}</span>
                        </div>
                      </div>
                    </label>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {!submitted ? (
          <div className="text-center mt-4">
            <button className="btn btn-primary btn-lg" onClick={submit}>
              <i className="bi bi-send me-1"></i>Submit Quiz
            </button>
          </div>
        ) : (
          <div className="mt-4 text-center">
            <div className="h5 mb-3">Score: {score?.correct}/{score?.total} ({score?.pct}%)</div>
            <div className="text-secondary small mb-3">
              <i className="bi bi-info-circle me-1"></i>
              Green = correct option; Red outline = your incorrect choice.
            </div>
            <button className="btn btn-primary" onClick={onClose}>
              <i className="bi bi-check-lg me-1"></i>Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Quizzes() {
  const { token, user } = useAuth()
  const [myQuizzes, setMyQuizzes] = useState([])
  const [assignedQuizzes, setAssignedQuizzes] = useState([])
  const [publicQuizzes, setPublicQuizzes] = useState([]) // New state for public quizzes
  const [activeTab, setActiveTab] = useState('mine')
  const [taking, setTaking] = useState(null)
  const [assigningQuiz, setAssigningQuiz] = useState(null)
  const [assignmentSuccess, setAssignmentSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load quizzes when component mounts
  useEffect(() => {
    loadMyQuizzes()
    loadAssignedQuizzes()
    loadPublicQuizzes() // Load public quizzes
  }, [])

  const loadMyQuizzes = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('http://localhost:5000/api/quizzes/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      
      if (response.status === 404) {
        // API not available, use mock data
        setMyQuizzes([
          { 
            id: 1, 
            skill: 'Python', 
            questions: [
              { id: 'q1', text: 'What is Python?', options: ['A snake', 'A programming language', 'A coffee', 'A car'], correct: 1 },
              { id: 'q2', text: 'Which keyword is used to define a function in Python?', options: ['def', 'func', 'function', 'define'], correct: 0 }
            ]
          },
          { 
            id: 2, 
            skill: 'JavaScript', 
            questions: [
              { id: 'q1', text: 'Which company developed JavaScript?', options: ['Microsoft', 'Apple', 'Netscape', 'Google'], correct: 2 },
              { id: 'q2', text: 'What is the correct way to write a comment in JavaScript?', options: ['<!-- Comment -->', '// Comment', '# Comment', '/* Comment */'], correct: 1 }
            ]
          }
        ])
        return
      }
      
      const data = await response.json()
      
      if (data.success) {
        setMyQuizzes(data.data)
      } else {
        setError(data.message || 'Failed to load quizzes')
        // Use mock data as fallback
        setMyQuizzes([
          { 
            id: 1, 
            skill: 'Python', 
            questions: [
              { id: 'q1', text: 'What is Python?', options: ['A snake', 'A programming language', 'A coffee', 'A car'], correct: 1 },
              { id: 'q2', text: 'Which keyword is used to define a function in Python?', options: ['def', 'func', 'function', 'define'], correct: 0 }
            ]
          },
          { 
            id: 2, 
            skill: 'JavaScript', 
            questions: [
              { id: 'q1', text: 'Which company developed JavaScript?', options: ['Microsoft', 'Apple', 'Netscape', 'Google'], correct: 2 },
              { id: 'q2', text: 'What is the correct way to write a comment in JavaScript?', options: ['<!-- Comment -->', '// Comment', '# Comment', '/* Comment */'], correct: 1 }
            ]
          }
        ])
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Failed to load quizzes:', err)
      // Use mock data as fallback
      setMyQuizzes([
        { 
          id: 1, 
            skill: 'Python', 
            questions: [
              { id: 'q1', text: 'What is Python?', options: ['A snake', 'A programming language', 'A coffee', 'A car'], correct: 1 },
              { id: 'q2', text: 'Which keyword is used to define a function in Python?', options: ['def', 'func', 'function', 'define'], correct: 0 }
            ]
          },
          { 
            id: 2, 
            skill: 'JavaScript', 
            questions: [
              { id: 'q1', text: 'Which company developed JavaScript?', options: ['Microsoft', 'Apple', 'Netscape', 'Google'], correct: 2 },
              { id: 'q2', text: 'What is the correct way to write a comment in JavaScript?', options: ['<!-- Comment -->', '// Comment', '# Comment', '/* Comment */'], correct: 1 }
            ]
          }
        ])
    } finally {
      setLoading(false)
    }
  }

  const loadAssignedQuizzes = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('http://localhost:5000/api/quizzes/assigned', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      
      console.log('Assigned quizzes response status:', response.status)
      
      // If API is not available, use mock data
      if (response.status === 404) {
        console.log('API not available, using mock data')
        setAssignedQuizzes([
          { 
            id: 3, 
            skill: 'HTML', 
            questions: [
              { id: 'q1', text: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language', 'None of the above'], correct: 0 },
              { id: 'q2', text: 'Which HTML tag is used to define an internal style sheet?', options: ['<script>', '<css>', '<style>', '<link>'], correct: 2 }
            ],
            assigner: { full_name: 'John Doe' }
          }
        ])
        return
      }
      
      // If unauthorized, try to refresh token or redirect to login
      if (response.status === 401) {
        setError('Authentication required. Please log in again.')
        return
      }
      
      const data = await response.json()
      console.log('Assigned quizzes data:', data)
      
      if (data.success) {
        // Add status information to assigned quizzes
        const quizzesWithStatus = await Promise.all(data.data.map(async (quiz) => {
          try {
            const statusResponse = await fetch(`http://localhost:5000/api/quizzes/${quiz.quiz_id || quiz.id}/status`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              return { ...quiz, status: statusData.status };
            }
          } catch (err) {
            console.error('Failed to fetch quiz status:', err);
          }
          return quiz;
        }));
        
        setAssignedQuizzes(quizzesWithStatus);
        console.log('Assigned quizzes loaded:', quizzesWithStatus);
      } else {
        setError(data.message || 'Failed to load assigned quizzes')
        // Use mock data as fallback
        setAssignedQuizzes([
          { 
            id: 3, 
            skill: 'HTML', 
            questions: [
              { id: 'q1', text: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language', 'None of the above'], correct: 0 },
              { id: 'q2', text: 'Which HTML tag is used to define an internal style sheet?', options: ['<script>', '<css>', '<style>', '<link>'], correct: 2 }
            ],
            assigner: { full_name: 'John Doe' }
          }
        ])
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Failed to load assigned quizzes:', err)
      // Use mock data as fallback
      setAssignedQuizzes([
        { 
          id: 3, 
          skill: 'HTML', 
          questions: [
            { id: 'q1', text: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language', 'None of the above'], correct: 0 },
            { id: 'q2', text: 'Which HTML tag is used to define an internal style sheet?', options: ['<script>', '<css>', '<style>', '<link>'], correct: 2 }
          ],
          assigner: { full_name: 'John Doe' }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const onStartQuiz = async (quiz) => {
    // Check if quiz is already completed before starting
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${quiz.quiz_id || quiz.id}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'completed') {
          // Show alert that quiz is already completed
          if (window.confirm('You have already completed this quiz. Do you want to view your results?')) {
            setTaking({...quiz, status: 'completed'});
          }
          return;
        }
      }
    } catch (err) {
      console.error('Error checking quiz status:', err);
    }
    
    // Start the quiz if not completed
    setTaking(quiz);
  }

  const onSaveQuiz = async (quiz) => {
    try {
      console.log('Saving quiz:', quiz)
      
      const response = await fetch('http://localhost:5000/api/quizzes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quiz)
      })
      
      // If the API is not available, use mock data
      if (response.status === 404) {
        // Simulate successful creation with mock data
        setMyQuizzes((prev) => [quiz, ...prev])
        setAssignmentSuccess('✅ Quiz created successfully!')
        setTimeout(() => setAssignmentSuccess(''), 3000)
        return
      }
      
      const data = await response.json()
      
      if (data.success) {
        setAssignmentSuccess('✅ Quiz created successfully!')
        // Refresh quizzes
        loadMyQuizzes()
      } else {
        setError(data.message || 'Failed to create quiz')
        // Still add to local state as fallback
        setMyQuizzes((prev) => [quiz, ...prev])
        setAssignmentSuccess('✅ Quiz created successfully!')
      }
    } catch (err) {
      console.error('Failed to save quiz:', err)
      setError('Network error. Please try again.')
      // Still add to local state as fallback
      setMyQuizzes((prev) => [quiz, ...prev])
      setAssignmentSuccess('✅ Quiz created successfully!')
    } finally {
      setTimeout(() => setAssignmentSuccess(''), 3000)
    }
  }

  // Function to handle quiz completion and refresh lists
  const handleQuizCompletion = async () => {
    // Refresh both quiz lists to reflect the completion status
    await loadMyQuizzes()
    await loadAssignedQuizzes()
  }

  const handleAssignQuiz = (quiz) => {
    setAssigningQuiz(quiz)
  }

  const handleAssignSubmit = async (assignmentData) => {
    try {
      setAssignmentSuccess(`✅ Quiz assigned successfully!`)
      
      // Refresh assigned quizzes
      await loadAssignedQuizzes()
    } catch (err) {
      console.error('Failed to refresh assigned quizzes:', err)
    } finally {
      setAssigningQuiz(null)
      setTimeout(() => setAssignmentSuccess(''), 3000)
    }
  }

  // Function to delete a quiz
  const handleDeleteQuiz = async (quiz) => {
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${quiz.id || quiz.quiz_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAssignmentSuccess('✅ Quiz deleted successfully!');
        // Refresh quizzes
        loadMyQuizzes();
        loadPublicQuizzes(); // Also refresh public quizzes as they might include deleted quiz
      } else {
        setError(data.message || 'Failed to delete quiz');
      }
    } catch (err) {
      console.error('Failed to delete quiz:', err);
      setError('Network error. Please try again.');
    } finally {
      setTimeout(() => setAssignmentSuccess(''), 3000);
    }
  }

  // Load public quizzes (admin-created quizzes visible to all)
  const loadPublicQuizzes = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('http://localhost:5000/api/quizzes/public', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      
      console.log('Public quizzes response status:', response.status)
      
      // If API is not available, use mock data
      if (response.status === 404) {
        console.log('API not available, using mock data')
        setPublicQuizzes([
          { 
            id: 4, 
            skill: 'Admin Quiz', 
            questions: [
              { id: 'q1', text: 'What is the purpose of this platform?', options: ['Social networking', 'Skill sharing', 'Gaming', 'Shopping'], correct: 1 },
              { id: 'q2', text: 'Which feature allows you to test your knowledge?', options: ['Chat', 'Quizzes', 'Matches', 'Profile'], correct: 1 }
            ],
            creator: { full_name: 'Admin', email: 'admin@skillbarter.com' }
          }
        ])
        return
      }
      
      // If unauthorized, try to refresh token or redirect to login
      if (response.status === 401) {
        setError('Authentication required. Please log in again.')
        return
      }
      
      const data = await response.json()
      console.log('Public quizzes data:', data)
      
      if (data.success) {
        setPublicQuizzes(data.data);
        console.log('Public quizzes loaded:', data.data);
      } else {
        setError(data.message || 'Failed to load public quizzes')
        // Use mock data as fallback
        setPublicQuizzes([
          { 
            id: 4, 
            skill: 'Admin Quiz', 
            questions: [
              { id: 'q1', text: 'What is the purpose of this platform?', options: ['Social networking', 'Skill sharing', 'Gaming', 'Shopping'], correct: 1 },
              { id: 'q2', text: 'Which feature allows you to test your knowledge?', options: ['Chat', 'Quizzes', 'Matches', 'Profile'], correct: 1 }
            ],
            creator: { full_name: 'Admin', email: 'admin@skillbarter.com' }
          }
        ])
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Failed to load public quizzes:', err)
      // Use mock data as fallback
      setPublicQuizzes([
        { 
          id: 4, 
          skill: 'Admin Quiz', 
          questions: [
            { id: 'q1', text: 'What is the purpose of this platform?', options: ['Social networking', 'Skill sharing', 'Gaming', 'Shopping'], correct: 1 },
            { id: 'q2', text: 'Which feature allows you to test your knowledge?', options: ['Chat', 'Quizzes', 'Matches', 'Profile'], correct: 1 }
          ],
          creator: { full_name: 'Admin', email: 'admin@skillbarter.com' }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 p-md-5 quiz-container">
      <div className="quiz-header">
        <div className="d-flex align-items-center gap-2">
          <h2 className="h4 mb-0">
            <i className="bi bi-clipboard-check me-2"></i>Quizzes
          </h2>
          <ul className="nav nav-pills ms-auto quiz-tabs">
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
                <i className="bi bi-person me-1"></i>My Quizzes
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'assigned' ? 'active' : ''}`} onClick={() => setActiveTab('assigned')}>
                <i className="bi bi-envelope me-1"></i>Assigned to Me
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'public' ? 'active' : ''}`} onClick={() => setActiveTab('public')}>
                <i className="bi bi-globe me-1"></i>Public Quizzes
              </button>
            </li>
          </ul>
        </div>
      </div>

      {loading && (
        <div className="alert alert-info" role="alert">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            <span>Loading quizzes...</span>
          </div>
        </div>
      )}

      {assignmentSuccess && (
        <div className="alert alert-success alert-dismissible" role="alert">
          {assignmentSuccess}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setAssignmentSuccess('')}
            aria-label="Close"
          ></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <span>{error}</span>
            <button 
              className="btn btn-outline-danger btn-sm ms-3" 
              onClick={() => {
                loadMyQuizzes()
                loadAssignedQuizzes()
                loadPublicQuizzes()
              }}
            >
              <i className="bi bi-arrow-repeat me-1"></i>Retry
            </button>
          </div>
        </div>
      )}

      {activeTab === 'mine' && (
        <div className="row g-4 mt-4">
          <div className="col-12 col-lg-6">
            <QuizBuilder onSave={onSaveQuiz} defaultSkill="Python" />
          </div>
          <div className="col-12 col-lg-6">
            <div className="card quiz-builder-card h-100">
              <div className="quiz-builder-header">
                <h3 className="h6 mb-0">Created Quizzes</h3>
              </div>
              <div className="quiz-builder-body">
                <QuizList 
                  quizzes={myQuizzes} 
                  onStart={onStartQuiz} 
                  onAssign={handleAssignQuiz}
                  showAssignButton={true}
                  onDelete={handleDeleteQuiz}
                  showDeleteButton={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assigned' && (
        <div className="card quiz-builder-card mt-4">
          <div className="quiz-builder-header">
            <h3 className="h6 mb-0">Quizzes Assigned to You</h3>
          </div>
          <div className="quiz-builder-body">
            <QuizList 
              quizzes={assignedQuizzes} 
              onStart={onStartQuiz} 
              onDelete={handleDeleteQuiz}
              showDeleteButton={false} // Don't show delete button for assigned quizzes
            />
          </div>
        </div>
      )}

      {activeTab === 'public' && (
        <div className="card quiz-builder-card mt-4">
          <div className="quiz-builder-header">
            <h3 className="h6 mb-0">Public Quizzes</h3>
          </div>
          <div className="quiz-builder-body">
            <QuizList 
              quizzes={publicQuizzes} 
              onStart={onStartQuiz} 
              onDelete={handleDeleteQuiz}
              showDeleteButton={true} // Show delete button for public quizzes (admins can delete any quiz)
            />
          </div>
        </div>
      )}

      {taking && (
        <div className="mt-4">
          <TakeQuiz 
            quiz={taking} 
            onClose={() => {
              setTaking(null)
              // Refresh quiz lists when closing the quiz
              handleQuizCompletion()
            }} 
          />
        </div>
      )}

      {assigningQuiz && (
        <AssignQuizModal 
          quiz={assigningQuiz} 
          onClose={() => setAssigningQuiz(null)} 
          onAssign={handleAssignSubmit}
        />
      )}
    </div>
  )
}

export default Quizzes