import React, { useState, useEffect } from 'react'
import TagInput from '../components/TagInput'
import { useAuth } from '../context/AuthContext'

function Skills() {
  const { token } = useAuth()
  const [teach, setTeach] = useState([])
  const [learn, setLearn] = useState([])
  const [availableSkills, setAvailableSkills] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load available skills and user's skills
  useEffect(() => {
    const initializeSkills = async () => {
      await loadSkills()
      await loadUserSkills()
    }
    initializeSkills()
  }, [token]) // Only depend on token to prevent unnecessary calls

  const loadSkills = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/skills/all')
      const data = await response.json()
      if (data.success) {
        console.log('Available skills loaded:', data.data)
        setAvailableSkills(data.data)
      }
    } catch (err) {
      console.error('Failed to load skills:', err)
    }
  }

  const loadUserSkills = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/skills/my-skills', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (data.success) {
        console.log('User skills loaded:', data.data)
        setTeach(data.data.teach || [])
        setLearn(data.data.learn || [])
      }
    } catch (err) {
      console.error('Failed to load user skills:', err)
    }
  }

  const handleAddSkill = async (skillName, skillType) => {
    try {
      setLoading(true)
      setError('')
      
      // Find the skill in available skills or create it
      console.log('Looking for skill:', skillName)
      console.log('Available skills:', availableSkills)
      let skill = availableSkills.find(s => s.skill_name.toLowerCase() === skillName.toLowerCase())
      console.log('Found skill:', skill)
      
      if (!skill) {
        setError(`Skill "${skillName}" not found in available skills list. Available skills: ${availableSkills.map(s => s.skill_name).join(', ')}`)
        return
      }

      const response = await fetch('http://localhost:5000/api/skills/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skill_id: skill.skill_id,
          skill_type: skillType
        })
      })

      const data = await response.json()
      if (data.success) {
        // Reload user skills
        await loadUserSkills()
        setSuccess(`Added ${skillName} to ${skillType} skills!`)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to add skill')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSkill = async (userSkillId, skillName, skillType) => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`http://localhost:5000/api/skills/${userSkillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        // Reload user skills
        await loadUserSkills()
        setSuccess(`Removed ${skillName} from ${skillType} skills!`)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to remove skill')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 p-md-5" style={{ backgroundColor: 'var(--sb-body-bg)' }}>
      <div className="row g-4">
        {/* Alert Messages */}
        {error && (
          <div className="col-12">
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          </div>
        )}
        
        {success && (
          <div className="col-12">
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {success}
              <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
            </div>
          </div>
        )}

        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100" style={{ backgroundColor: 'var(--sb-sidebar-bg)', borderColor: 'var(--sb-border-color)' }}>
            <div className="card-body">
              <h2 className="h5 mb-3">Skills I Can Teach</h2>
              <TagInput 
                value={teach.map(skill => skill.name)} 
                onChange={(newSkills) => {
                  // Handle adding new skills
                  const currentSkillNames = teach.map(s => s.name)
                  const addedSkills = newSkills.filter(name => !currentSkillNames.includes(name))
                  const removedSkills = teach.filter(skill => !newSkills.includes(skill.name))
                  
                  // Add new skills
                  addedSkills.forEach(skillName => {
                    handleAddSkill(skillName, 'teach')
                  })
                  
                  // Remove skills
                  removedSkills.forEach(skill => {
                    handleRemoveSkill(skill.id, skill.name, 'teach')
                  })
                }} 
                placeholder="Add a skill to teach..." 
                suggestions={availableSkills.map(skill => skill.skill_name)}
                disabled={loading}
              />
            </div>
          </div>
        </div>
        
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100" style={{ backgroundColor: 'var(--sb-sidebar-bg)', borderColor: 'var(--sb-border-color)' }}>
            <div className="card-body">
              <h2 className="h5 mb-3">Skills I Want to Learn</h2>
              <TagInput 
                value={learn.map(skill => skill.name)} 
                onChange={(newSkills) => {
                  // Handle adding new skills
                  const currentSkillNames = learn.map(s => s.name)
                  const addedSkills = newSkills.filter(name => !currentSkillNames.includes(name))
                  const removedSkills = learn.filter(skill => !newSkills.includes(skill.name))
                  
                  // Add new skills
                  addedSkills.forEach(skillName => {
                    handleAddSkill(skillName, 'learn')
                  })
                  
                  // Remove skills
                  removedSkills.forEach(skill => {
                    handleRemoveSkill(skill.id, skill.name, 'learn')
                  })
                }} 
                placeholder="Add a skill to learn..." 
                suggestions={availableSkills.map(skill => skill.skill_name)}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Skills


