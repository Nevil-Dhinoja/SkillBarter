import React, { useMemo, useState } from 'react'

function QuizBuilder({ onSave, defaultSkill = 'Python' }) {
  const [skill] = useState(defaultSkill)
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

  const save = () => {
    onSave?.({ id: Math.random().toString(36).slice(2), skill, questions })
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h3 className="h5 mb-3">Create Quiz</h3>
        <div className="mb-3">
          <label className="form-label">Skill</label>
          <input className="form-control" value={skill} readOnly />
        </div>

        {questions.map((q, qi) => (
          <div key={q.id} className="border rounded p-3 mb-3">
            <div className="mb-2">
              <label className="form-label">Question {qi + 1}</label>
              <input
                className="form-control"
                placeholder="Enter question text"
                value={q.text}
                onChange={(e) => updateQuestion(qi, { text: e.target.value })}
              />
            </div>
            <div className="row g-2">
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
                      className="form-control"
                      placeholder={`Option ${oi + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" type="button" onClick={addQuestion}>
            Add Question
          </button>
          <button className="btn btn-primary" type="button" onClick={save}>
            Save Quiz
          </button>
        </div>
      </div>
    </div>
  )
}

function QuizList({ quizzes = [], onStart }) {
  if (!quizzes.length) {
    return <div className="text-secondary small">No quizzes yet.</div>
  }
  return (
    <div className="row g-3">
      {quizzes.map((q) => (
        <div className="col-12 col-md-6 col-lg-4" key={q.id}>
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body d-flex flex-column">
              <div className="fw-semibold mb-1">{q.skill} Quiz</div>
              <div className="small text-secondary mb-3">{q.questions.length} questions</div>
              <button className="btn btn-primary mt-auto" onClick={() => onStart(q)}>Start Quiz</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function TakeQuiz({ quiz, onClose }) {
  const [answers, setAnswers] = useState(Array(quiz.questions.length).fill(null))
  const [submitted, setSubmitted] = useState(false)

  const score = useMemo(() => {
    if (!submitted) return null
    const correct = quiz.questions.reduce((acc, q, i) => (answers[i] === q.correct ? acc + 1 : acc), 0)
    const pct = Math.round((correct / quiz.questions.length) * 100)
    return { correct, total: quiz.questions.length, pct }
  }, [submitted, answers, quiz])

  const submit = () => setSubmitted(true)
  const select = (qi, oi) => setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="h5 mb-0">{quiz.skill} Quiz</h3>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        </div>
        {quiz.questions.map((q, qi) => (
          <div key={q.id} className="mb-3">
            <div className="fw-semibold mb-2">Q{qi + 1}. {q.text || 'Untitled question'}</div>
            <div className="row g-2">
              {q.options.map((opt, oi) => (
                <label key={oi} className={`col-12 col-md-6`}> 
                  <div className={`form-check p-3 border rounded ${submitted ? (oi === q.correct ? 'border-success' : answers[qi] === oi ? 'border-danger' : '') : ''}`}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name={`ans-${q.id}`}
                      checked={answers[qi] === oi}
                      onChange={() => select(qi, oi)}
                    />
                    <span className="ms-2">{opt || `Option ${oi + 1}`}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}

        {!submitted ? (
          <button className="btn btn-primary" onClick={submit}>Submit Quiz</button>
        ) : (
          <div className="mt-3">
            <div className="fw-semibold">Score: {score.correct}/{score.total} ({score.pct}%)</div>
            <div className="text-secondary small">Green = correct option; Red outline = your incorrect choice.</div>
          </div>
        )}
      </div>
    </div>
  )
}

function Quizzes() {
  const [myQuizzes, setMyQuizzes] = useState([])
  const [assigned, setAssigned] = useState([])
  const [activeTab, setActiveTab] = useState('mine')
  const [taking, setTaking] = useState(null)

  const onSaveQuiz = (quiz) => {
    setMyQuizzes((prev) => [quiz, ...prev])
    // simulate assignment to self for demo
    setAssigned((prev) => [quiz, ...prev])
  }

  return (
    <div className="p-4 p-md-5">
      <div className="d-flex align-items-center gap-2 mb-3">
        <h2 className="h5 mb-0">Quizzes</h2>
        <ul className="nav nav-pills ms-auto">
          <li className="nav-item"><button className={`nav-link ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>My Quizzes</button></li>
          <li className="nav-item"><button className={`nav-link ${activeTab === 'assigned' ? 'active' : ''}`} onClick={() => setActiveTab('assigned')}>Assigned to Me</button></li>
        </ul>
      </div>

      {activeTab === 'mine' && (
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <QuizBuilder onSave={onSaveQuiz} defaultSkill="Python" />
          </div>
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h3 className="h6 mb-3">Created Quizzes</h3>
                <QuizList quizzes={myQuizzes} onStart={(q) => setTaking(q)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assigned' && (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <QuizList quizzes={assigned} onStart={(q) => setTaking(q)} />
          </div>
        </div>
      )}

      {taking && (
        <div className="mt-4">
          <TakeQuiz quiz={taking} onClose={() => setTaking(null)} />
        </div>
      )}
    </div>
  )
}

export default Quizzes


