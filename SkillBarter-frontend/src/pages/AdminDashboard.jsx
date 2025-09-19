import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function AdminDashboard() {
  const { token, user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('skills')
  const [skills, setSkills] = useState([])
  const [users, setUsers] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [newSkill, setNewSkill] = useState({ name: '', category: '' })
  const [editingUser, setEditingUser] = useState(null)
  const [editingSkill, setEditingSkill] = useState(null)
  const [editingQuiz, setEditingQuiz] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Check if user is admin
  const isAdmin = user && user.email === 'admin@skillbarter.com'

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/dashboard'
    }
  }, [isAdmin])

  // Load data based on active tab
  useEffect(() => {
    if (isAdmin) {
      switch (activeTab) {
        case 'skills':
          loadSkills()
          break
        case 'users':
          loadUsers()
          break
        case 'quizzes':
          loadQuizzes()
          break
        default:
          break
      }
    }
  }, [activeTab, isAdmin])

  const loadSkills = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/skills/all')
      const data = await response.json()
      if (data.success) {
        setSkills(data.data)
      } else {
        setError(data.message || 'Failed to load skills')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  const loadQuizzes = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/quizzes/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (data.success) {
        setQuizzes(data.data)
      } else {
        setError(data.message || 'Failed to load quizzes')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSkill = async (e) => {
    e.preventDefault()
    if (!newSkill.name.trim()) {
      setError('Skill name is required')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch('http://localhost:5000/api/users/skills', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newSkill.name,
          category: newSkill.category || 'General'
        })
      })

      const data = await response.json()

      if (data.success) {
        setNewSkill({ name: '', category: '' })
        setSuccess('Skill added successfully!')
        // Reload skills
        loadSkills()
      } else {
        setError(data.message || 'Failed to add skill')
      }
    } catch (err) {
      setError('Failed to add skill. Please try again.')
    } finally {
      setLoading(false)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleUpdateSkill = async (e) => {
    e.preventDefault()
    if (!editingSkill.name.trim()) {
      setError('Skill name is required')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch(`http://localhost:5000/api/users/skills/${editingSkill.skill_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editingSkill.name,
          category: editingSkill.category || 'General'
        })
      })

      const data = await response.json()

      if (data.success) {
        setEditingSkill(null)
        setSuccess('Skill updated successfully!')
        // Reload skills
        loadSkills()
      } else {
        setError(data.message || 'Failed to update skill')
      }
    } catch (err) {
      setError('Failed to update skill. Please try again.')
    } finally {
      setLoading(false)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleDeleteSkill = async (skillId, skillName) => {
    if (!window.confirm(`Are you sure you want to delete the skill "${skillName}"?`)) {
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch(`http://localhost:5000/api/users/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Skill deleted successfully!')
        // Reload skills
        loadSkills()
      } else {
        setError(data.message || 'Failed to delete skill')
      }
    } catch (err) {
      setError('Failed to delete skill. Please try again.')
    } finally {
      setLoading(false)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError('')

      const response = await fetch(`http://localhost:5000/api/users/${editingUser.user_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: editingUser.full_name,
          email: editingUser.email,
          location: editingUser.location,
          bio: editingUser.bio
        })
      })

      const data = await response.json()

      if (data.success) {
        setEditingUser(null)
        setSuccess('User updated successfully!')
        // Reload users
        loadUsers()
      } else {
        setError(data.message || 'Failed to update user')
      }
    } catch (err) {
      setError('Failed to update user. Please try again.')
    } finally {
      setLoading(false)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete the user "${userName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('User deleted successfully!')
        // Reload users
        loadUsers()
      } else {
        setError(data.message || 'Failed to delete user')
      }
    } catch (err) {
      setError('Failed to delete user. Please try again.')
    } finally {
      setLoading(false)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleUpdateQuiz = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError('')

      const response = await fetch(`http://localhost:5000/api/quizzes/${editingQuiz.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skill: editingQuiz.skill,
          questions: editingQuiz.questions
        })
      })

      const data = await response.json()

      if (data.success) {
        setEditingQuiz(null)
        setSuccess('Quiz updated successfully!')
        // Reload quizzes
        loadQuizzes()
      } else {
        setError(data.message || 'Failed to update quiz')
      }
    } catch (err) {
      setError('Failed to update quiz. Please try again.')
    } finally {
      setLoading(false)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleDeleteQuiz = async (quizId, quizName) => {
    if (!window.confirm(`Are you sure you want to delete the quiz "${quizName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Quiz deleted successfully!')
        // Reload quizzes
        loadQuizzes()
      } else {
        setError(data.message || 'Failed to delete quiz')
      }
    } catch (err) {
      setError('Failed to delete quiz. Please try again.')
    } finally {
      setLoading(false)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  if (!isAdmin) {
    return (
      <div className="p-4 p-md-5">
        <div className="alert alert-danger">
          Access denied. Admins only.
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 p-md-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Admin Dashboard</h2>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'skills' ? 'active' : ''}`} 
            onClick={() => setActiveTab('skills')}
          >
            Skills Management
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} 
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'quizzes' ? 'active' : ''}`} 
            onClick={() => setActiveTab('quizzes')}
          >
            Quiz Management
          </button>
        </li>
      </ul>

      {/* Skills Management Tab */}
      {activeTab === 'skills' && (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h3 className="h5 mb-4">Skills Management</h3>
            
            {/* Add New Skill Form */}
            <div className="mb-4 p-3 border rounded">
              <h4 className="h6 mb-3">Add New Skill</h4>
              <form onSubmit={handleAddSkill}>
                <div className="row g-3">
                  <div className="col-12 col-md-5">
                    <label className="form-label">Skill Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                      placeholder="Enter skill name"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-12 col-md-5">
                    <label className="form-label">Category (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newSkill.category}
                      onChange={(e) => setNewSkill({...newSkill, category: e.target.value})}
                      placeholder="Enter category"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-12 col-md-2 d-flex align-items-end">
                    <button 
                      type="submit" 
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >
                      {loading ? 'Adding...' : 'Add Skill'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Edit Skill Form (if editing) */}
            {editingSkill && (
              <div className="mb-4 p-3 border rounded bg-light">
                <h4 className="h6 mb-3">Edit Skill</h4>
                <form onSubmit={handleUpdateSkill}>
                  <div className="row g-3">
                    <div className="col-12 col-md-5">
                      <label className="form-label">Skill Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingSkill.name}
                        onChange={(e) => setEditingSkill({...editingSkill, name: e.target.value})}
                        placeholder="Enter skill name"
                        disabled={loading}
                      />
                    </div>
                    <div className="col-12 col-md-5">
                      <label className="form-label">Category (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingSkill.category}
                        onChange={(e) => setEditingSkill({...editingSkill, category: e.target.value})}
                        placeholder="Enter category"
                        disabled={loading}
                      />
                    </div>
                    <div className="col-12 col-md-2 d-flex align-items-end">
                      <button 
                        type="submit" 
                        className="btn btn-success w-100 me-2"
                        disabled={loading}
                      >
                        {loading ? 'Updating...' : 'Update'}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary w-100"
                        onClick={() => setEditingSkill(null)}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Skills List */}
            <div>
              <h4 className="h6 mb-3">All Skills ({skills.length})</h4>
              {loading && activeTab === 'skills' ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : skills.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  No skills found.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Skill Name</th>
                        <th>Category</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skills
                        .sort((a, b) => a.skill_name.localeCompare(b.skill_name))
                        .map((skill) => (
                          <tr key={skill.skill_id}>
                            <td>{skill.skill_id}</td>
                            <td>{skill.skill_name}</td>
                            <td>{skill.category || 'General'}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => setEditingSkill({...skill})}
                                disabled={loading}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteSkill(skill.skill_id, skill.skill_name)}
                                disabled={loading}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h3 className="h5 mb-4">User Management</h3>
            
            {/* Edit User Form (if editing) */}
            {editingUser && (
              <div className="mb-4 p-3 border rounded bg-light">
                <h4 className="h6 mb-3">Edit User</h4>
                <form onSubmit={handleUpdateUser}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingUser.full_name}
                        onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                        placeholder="Enter full name"
                        disabled={loading}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                        placeholder="Enter email"
                        disabled={loading}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingUser.location || ''}
                        onChange={(e) => setEditingUser({...editingUser, location: e.target.value})}
                        placeholder="Enter location"
                        disabled={loading}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Bio</label>
                      <textarea
                        className="form-control"
                        value={editingUser.bio || ''}
                        onChange={(e) => setEditingUser({...editingUser, bio: e.target.value})}
                        placeholder="Enter bio"
                        rows="2"
                        disabled={loading}
                      ></textarea>
                    </div>
                    <div className="col-12 d-flex justify-content-end">
                      <button 
                        type="submit" 
                        className="btn btn-success me-2"
                        disabled={loading}
                      >
                        {loading ? 'Updating...' : 'Update User'}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setEditingUser(null)}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {loading && activeTab === 'users' ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-4 text-muted">
                No users found.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.user_id}>
                        <td>{user.user_id}</td>
                        <td>{user.full_name}</td>
                        <td>{user.email}</td>
                        <td>{user.location || 'Not specified'}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => setEditingUser({...user})}
                            disabled={loading || user.email === 'admin@skillbarter.com'}
                          >
                            Edit
                          </button>
                          {user.email !== 'admin@skillbarter.com' && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteUser(user.user_id, user.full_name)}
                              disabled={loading}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quiz Management Tab */}
      {activeTab === 'quizzes' && (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h3 className="h5 mb-4">Quiz Management</h3>
            
            {/* Edit Quiz Form (if editing) */}
            {editingQuiz && (
              <div className="mb-4 p-3 border rounded bg-light">
                <h4 className="h6 mb-3">Edit Quiz</h4>
                <form onSubmit={handleUpdateQuiz}>
                  <div className="mb-3">
                    <label className="form-label">Quiz Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingQuiz.skill}
                      onChange={(e) => setEditingQuiz({...editingQuiz, skill: e.target.value})}
                      placeholder="Enter quiz title"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Questions</label>
                    {editingQuiz.questions.map((question, qIndex) => (
                      <div key={qIndex} className="border rounded p-3 mb-3">
                        <div className="mb-2">
                          <input
                            type="text"
                            className="form-control"
                            value={question.text}
                            onChange={(e) => {
                              const updatedQuestions = [...editingQuiz.questions];
                              updatedQuestions[qIndex].text = e.target.value;
                              setEditingQuiz({...editingQuiz, questions: updatedQuestions});
                            }}
                            placeholder="Enter question text"
                            disabled={loading}
                          />
                        </div>
                        <div className="row g-2">
                          {question.options.map((option, oIndex) => (
                            <div className="col-12 col-md-6" key={oIndex}>
                              <div className="input-group">
                                <div className="input-group-text">
                                  <input
                                    className="form-check-input mt-0"
                                    type="radio"
                                    name={`correct-${qIndex}`}
                                    checked={question.correct === oIndex}
                                    onChange={() => {
                                      const updatedQuestions = [...editingQuiz.questions];
                                      updatedQuestions[qIndex].correct = oIndex;
                                      setEditingQuiz({...editingQuiz, questions: updatedQuestions});
                                    }}
                                    disabled={loading}
                                  />
                                </div>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={option}
                                  onChange={(e) => {
                                    const updatedQuestions = [...editingQuiz.questions];
                                    updatedQuestions[qIndex].options[oIndex] = e.target.value;
                                    setEditingQuiz({...editingQuiz, questions: updatedQuestions});
                                  }}
                                  placeholder={`Option ${oIndex + 1}`}
                                  disabled={loading}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="d-flex justify-content-end">
                    <button 
                      type="submit" 
                      className="btn btn-success me-2"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Quiz'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setEditingQuiz(null)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading && activeTab === 'quizzes' ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-4 text-muted">
                No quizzes found.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Creator</th>
                      <th>Questions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes.map((quiz) => (
                      <tr key={quiz.id}>
                        <td>{quiz.id}</td>
                        <td>{quiz.skill}</td>
                        <td>{quiz.creator?.full_name || 'Unknown'}</td>
                        <td>{quiz.questions?.length || 0}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => setEditingQuiz({...quiz})}
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteQuiz(quiz.id, quiz.skill)}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard