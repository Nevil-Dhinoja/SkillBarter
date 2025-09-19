import React, { useState, useEffect, useMemo } from 'react'
import SidebarNav from '../components/SidebarNav'
import Topbar from '../components/Topbar'
import Profile from './Profile'
import Skills from './Skills'
import Matches from './Matches'
import Chat from './Chat'
import Quizzes from './Quizzes'
import Settings from './Settings'
import PerformanceChart from '../components/PerformanceChart'
import QuizPerformance from './QuizPerformance'
import { useAuth } from '../context/AuthContext'

function Dashboard({ activeKey, setActiveKey, theme, onToggleTheme }) {
  const { user, getUserFullName } = useAuth()
  const [chatUser, setChatUser] = useState(null)
  const [popularSkills, setPopularSkills] = useState([])
  const [allSkills, setAllSkills] = useState([])
  const [loadingSkills, setLoadingSkills] = useState(true)
  const [showAllSkills, setShowAllSkills] = useState(false)
  
  // Static quiz results data
  const [results] = useState([
    { skill: 'Python', date: '2025-07-01', score: 72 },
    { skill: 'Photoshop', date: '2025-07-05', score: 48 },
    { skill: 'Guitar', date: '2025-07-12', score: 64 },
    { skill: 'Cooking', date: '2025-07-18', score: 90 },
    { skill: 'Python', date: '2025-07-25', score: 58 },
    { skill: 'Photoshop', date: '2025-07-30', score: 82 },
  ])

  // Fetch popular skills from database
  useEffect(() => {
    fetchPopularSkills()
  }, [])

  const fetchPopularSkills = async () => {
    try {
      setLoadingSkills(true)
      const response = await fetch('http://localhost:5000/api/skills/all')
      const data = await response.json()
      
      if (data.success) {
        // Store all skills
        setAllSkills(data.data)
        
        // Get first 4 skills for popular section and assign icons and colors
        const skillsWithIcons = data.data.slice(0, 4).map((skill, index) => {
          const icons = ['bi-brush', 'bi-code-slash', 'bi-music-note-beamed', 'bi-egg-fried']
          const colors = ['text-primary', 'text-success', 'text-warning', 'text-danger']
          
          return {
            title: skill.skill_name,
            category: skill.category,
            icon: icons[index % icons.length],
            colorClass: colors[index % colors.length]
          }
        })
        setPopularSkills(skillsWithIcons)
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error)
      // Fallback to static skills if API fails
      const fallbackSkills = [
        { skill_name: 'Photoshop', category: 'Design' },
        { skill_name: 'Python', category: 'Programming' },
        { skill_name: 'Guitar', category: 'Music' },
        { skill_name: 'Cooking', category: 'Lifestyle' },
      ]
      setAllSkills(fallbackSkills)
      setPopularSkills([
        { title: 'Photoshop', category: 'Design', icon: 'bi-brush', colorClass: 'text-primary' },
        { title: 'Python', category: 'Programming', icon: 'bi-code-slash', colorClass: 'text-success' },
        { title: 'Guitar', category: 'Music', icon: 'bi-music-note-beamed', colorClass: 'text-warning' },
        { title: 'Cooking', category: 'Lifestyle', icon: 'bi-egg-fried', colorClass: 'text-danger' },
      ])
    } finally {
      setLoadingSkills(false)
    }
  }

  // Handle Explore Skills button click
  const handleExploreSkills = () => {
    setShowAllSkills(true)
    // Scroll to the skills section
    setTimeout(() => {
      const skillsSection = document.getElementById('all-skills-section')
      if (skillsSection) {
        skillsSection.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  // Get skills with icons for display
  const getSkillsWithIcons = (skills) => {
    const icons = [
      'bi-brush', 'bi-code-slash', 'bi-music-note-beamed', 'bi-egg-fried',
      'bi-palette', 'bi-laptop', 'bi-camera', 'bi-book', 'bi-wrench',
      'bi-heart', 'bi-tree', 'bi-globe', 'bi-calculator', 'bi-microphone'
    ]
    const colors = [
      'text-primary', 'text-success', 'text-warning', 'text-danger',
      'text-info', 'text-secondary', 'text-dark'
    ]
    
    return skills.map((skill, index) => ({
      title: skill.skill_name,
      category: skill.category,
      icon: icons[index % icons.length],
      colorClass: colors[index % colors.length]
    }))
  }

  const summary = useMemo(() => {
    const scores = results.map((r) => r.score)
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    const hi = scores.length ? Math.max(...scores) : 0
    const lo = scores.length ? Math.min(...scores) : 0
    return { avg, count: scores.length, hi, lo }
  }, [results])

  return (
    <div className="container-fluid">
      <div>
        {/* Mobile header with toggle */}
        <div className="d-md-none p-3 d-flex align-items-center justify-content-between border-bottom bg-white sticky-top" style={{ zIndex: 1031 }}>
          <div className="fs-4 fw-bold">SkillBarter</div>
          <button
            className="btn btn-outline-secondary"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#sb-offcanvas"
            aria-controls="sb-offcanvas"
            aria-label="Open menu"
          >
            <i className="bi bi-list" />
          </button>
        </div>

        {/* Sidebar (desktop and tablet) */}
        <aside className="d-none d-md-block sidebar">
          <div className="p-3">
            <div className="sidebar-title mb-3">SkillBarter</div>
            <SidebarNav activeKey={activeKey} onSelect={setActiveKey} />
          </div>
        </aside>

        {/* Offcanvas Sidebar (mobile) */}
        <div
          className="offcanvas offcanvas-start"
          tabIndex="-1"
          id="sb-offcanvas"
          aria-labelledby="sb-offcanvas-label"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="sb-offcanvas-label">SkillBarter</h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div className="offcanvas-body">
            <SidebarNav activeKey={activeKey} onSelect={setActiveKey} />
          </div>
        </div>

        {/* Main content */}
        <main className="p-0 main-content">
          <Topbar theme={theme} onToggleTheme={onToggleTheme} />
          
          {/* Show Quiz Performance page when activeKey is 'quiz-performance' */}
          {activeKey === 'quiz-performance' ? (
            <QuizPerformance />
          ) : (
            <>
              {/* Sections for one-page scroll - only show when activeKey matches */}
              {activeKey === 'dashboard' && (
                <section id="dashboard" className="scroll-section">
                  {/* Hero */}
                  <div className="p-4 p-md-5 hero-section bg-light border-bottom">
                    <h1 className="display-6 fw-bold mb-2">
                      Welcome back, {getUserFullName()}! 👋
                    </h1>
                    <p className="lead text-secondary mb-4">
                      SkillBarter is a peer-to-peer platform where people exchange skills directly. Offer what you know, learn what you want — no fees, just mutual growth.
                    </p>
                    <button 
                      className="btn btn-primary btn-lg shadow-sm"
                      onClick={handleExploreSkills}
                    >
                      Explore Skills
                    </button>
                  </div>

                  {/* Cards */}
                  <div className="p-4 p-md-5">
                    <h2 className="h4 mb-3">Popular Skills</h2>
                    {loadingSkills ? (
                      <div className="text-center p-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading popular skills...</p>
                      </div>
                    ) : (
                      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
                        {popularSkills.map((skill) => (
                          <div className="col" key={skill.title}>
                            <div className="card h-100 shadow-sm border-0 skill-card">
                              <div className="card-body d-flex flex-column align-items-start">
                                <div className={`icon-wrap mb-3 ${skill.colorClass}`} aria-hidden="true">
                                  <i className={`bi ${skill.icon}`} />
                                </div>
                                <h3 className="h6 fw-semibold mb-1">{skill.title}</h3>
                                <p className="small text-secondary mb-0">
                                  Find peers to learn or exchange {skill.title} tips.
                                  {skill.category && <span className="d-block"><strong>Category:</strong> {skill.category}</span>}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Show All Skills button if not already showing all */}
                    {!showAllSkills && (
                      <div className="text-center mt-4">
                        <button 
                          className="btn btn-outline-primary btn-lg"
                          onClick={handleExploreSkills}
                        >
                          <i className="bi bi-grid-3x3-gap me-2"></i>
                          View All Skills ({allSkills.length} available)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* All Skills Section - shown when Explore Skills is clicked */}
                  {showAllSkills && (
                    <div 
                      id="all-skills-section" 
                      className="p-4 p-md-5" 
                      style={{ backgroundColor: 'var(--sb-body-bg)' }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="h4 mb-0">All Available Skills</h2>
                        <button 
                          className={`btn ${theme === 'dark' ? 'btn-outline-light' : 'btn-outline-secondary'}`}
                          onClick={() => setShowAllSkills(false)}
                        >
                          <i className="bi bi-x-lg me-1"></i>
                          Hide
                        </button>
                      </div>
                      
                      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                        {getSkillsWithIcons(allSkills).map((skill, index) => (
                          <div className="col" key={index}>
                            <div className="card h-100 shadow-sm border-0 skill-card">
                              <div className="card-body d-flex flex-column align-items-start">
                                <div className={`icon-wrap mb-3 ${skill.colorClass}`} aria-hidden="true">
                                  <i className={`bi ${skill.icon}`} />
                                </div>
                                <h3 className="h6 fw-semibold mb-1">{skill.title}</h3>
                                <p className="small text-secondary mb-0">
                                  {skill.category && <span className="d-block text-muted"><strong>Category:</strong> {skill.category}</span>}
                                  Find peers to learn or exchange {skill.title} skills.
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Back to top button */}
                      <div className="text-center mt-4">
                        <button 
                          className="btn btn-primary"
                          onClick={() => {
                            setShowAllSkills(false)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                        >
                          <i className="bi bi-arrow-up me-1"></i>
                          Back to Top
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Quiz Performance Analysis Summary in Dashboard - REMOVED as per user request */}
              
              {activeKey === 'profile' && <section id="profile" className="scroll-section"><Profile /></section>}
              {activeKey === 'skills' && <section id="skills" className="scroll-section"><Skills /></section>}
              {activeKey === 'matches' && (
                <section id="matches" className="scroll-section">
                  {chatUser ? (
                    <Chat 
                      initialUser={chatUser} 
                      onBackToMatches={() => setChatUser(null)} 
                    />
                  ) : (
                    <Matches onStartChat={(u) => setChatUser(u)} />
                  )}
                </section>
              )}
              {activeKey === 'quizzes' && <section id="quizzes" className="scroll-section"><Quizzes /></section>}
              {activeKey === 'feedback' && <section id="feedback" className="scroll-section"><div className="p-4 p-md-5"><h2>Feedback</h2><p>Feedback page content goes here.</p></div></section>}
              {activeKey === 'settings' && <section id="settings" className="scroll-section"><Settings theme={theme} /></section>}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard


