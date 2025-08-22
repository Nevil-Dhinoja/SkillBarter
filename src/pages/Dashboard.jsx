import React, { useMemo, useState } from 'react'
import SidebarNav from '../components/SidebarNav'
import Topbar from '../components/Topbar'
import Profile from './Profile'
import Skills from './Skills'
import Matches from './Matches'
import Chat from './Chat'
import Quizzes from './Quizzes'
import PerformanceChart from '../components/PerformanceChart'

function Dashboard({ activeKey, setActiveKey, theme, onToggleTheme }) {
  const [chatUser, setChatUser] = useState(null)
  const skills = [
    { title: 'Photoshop', icon: 'bi-brush', colorClass: 'text-primary' },
    { title: 'Python', icon: 'bi-code-slash', colorClass: 'text-success' },
    { title: 'Guitar', icon: 'bi-music-note-beamed', colorClass: 'text-warning' },
    { title: 'Cooking', icon: 'bi-egg-fried', colorClass: 'text-danger' },
  ]
  const [results] = useState([
    { skill: 'Python', date: '2025-07-01', score: 72 },
    { skill: 'Photoshop', date: '2025-07-05', score: 48 },
    { skill: 'Guitar', date: '2025-07-12', score: 64 },
    { skill: 'Cooking', date: '2025-07-18', score: 90 },
    { skill: 'Python', date: '2025-07-25', score: 58 },
    { skill: 'Photoshop', date: '2025-07-30', score: 82 },
  ])

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
          {/* Sections for one-page scroll */}
          <section id="dashboard" className="scroll-section">
            {/* Hero */}
            <div className="p-4 p-md-5 hero-section bg-light border-bottom">
              <h1 className="display-6 fw-bold mb-2">Learn and Teach Skills, Together.</h1>
              <p className="lead text-secondary mb-4">
                SkillBarter is a peer-to-peer platform where people exchange skills directly. Offer what you know, learn what you want — no fees, just mutual growth.
              </p>
              <button className="btn btn-primary btn-lg shadow-sm">Get Started</button>
            </div>

            {/* Cards */}
            <div className="p-4 p-md-5">
              <h2 className="h4 mb-3">Popular Skills</h2>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
                {skills.map((skill) => (
                  <div className="col" key={skill.title}>
                    <div className="card h-100 shadow-sm border-0 skill-card">
                      <div className="card-body d-flex flex-column align-items-start">
                        <div className={`icon-wrap mb-3 ${skill.colorClass}`} aria-hidden="true">
                          <i className={`bi ${skill.icon}`} />
                        </div>
                        <h3 className="h6 fw-semibold mb-1">{skill.title}</h3>
                        <p className="small text-secondary mb-0">Find peers to learn or exchange {skill.title} tips.</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Quiz Performance Analysis */}
          <div className="p-4 p-md-5">
            <h2 className="h5 mb-3">Quiz Performance Analysis</h2>
            <div className="row g-3 align-items-stretch">
              <div className="col-12 col-lg-4">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-2 mb-2"><i className="bi bi-graph-up-arrow text-primary" /> <span className="fw-semibold">Summary</span></div>
                    <div className="row text-center g-3">
                      <div className="col-4">
                        <div className="small text-secondary">Avg</div>
                        <div className="fs-4 fw-bold">{summary.avg}%</div>
                      </div>
                      <div className="col-4">
                        <div className="small text-secondary">Taken</div>
                        <div className="fs-4 fw-bold">{summary.count}</div>
                      </div>
                      <div className="col-4">
                        <div className="small text-secondary">High</div>
                        <div className="fs-4 fw-bold">{summary.hi}%</div>
                      </div>
                    </div>
                    <div className="row text-center g-3 mt-1">
                      <div className="col-12">
                        <div className="small text-secondary">Low</div>
                        <div className="fs-6 fw-semibold">{summary.lo}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-8">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-2 mb-2"><i className="bi bi-activity text-primary" /> <span className="fw-semibold">Progress</span></div>
                    <PerformanceChart data={results.map(r => ({ date: r.date, score: r.score }))} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm border-0 mt-3">
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-2"><i className="bi bi-table text-primary" /> <span className="fw-semibold">Recent Quiz Results</span></div>
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Skill</th>
                        <th>Date</th>
                        <th>Score</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.slice(-5).reverse().map((r, idx) => {
                        const passed = r.score >= 50
                        return (
                          <tr key={idx}>
                            <td>{r.skill}</td>
                            <td>{r.date}</td>
                            <td>{r.score}%</td>
                            <td>
                              <span className={`badge rounded-pill ${passed ? 'text-bg-success' : 'text-bg-danger'}`}>
                                {passed ? 'Passed' : 'Failed'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <section id="profile" className="scroll-section"><Profile /></section>
          <section id="skills" className="scroll-section"><Skills /></section>
          <section id="matches" className="scroll-section">
            {chatUser ? <Chat initialUser={chatUser} /> : <Matches onStartChat={(u) => setChatUser(u)} />}
          </section>
          <section id="quizzes" className="scroll-section"><Quizzes /></section>
        </main>
      </div>
    </div>
  )
}

export default Dashboard


