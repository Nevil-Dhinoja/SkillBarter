import React, { useMemo, useState } from 'react'

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

function Chat({ initialUser }) {
  const initialThreadId = initialUser ? 't1' : 't1'
  const [threads, setThreads] = useState(MOCK_THREADS)
  const [activeId, setActiveId] = useState(initialThreadId)
  const [draft, setDraft] = useState('')

  const active = useMemo(() => threads.find((t) => t.id === activeId) ?? threads[0], [threads, activeId])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setThreads((prev) => prev.map((t) => t.id === active.id ? { ...t, messages: [...t.messages, { id: Math.random().toString(36).slice(2), fromMe: true, text, at: 'now' }] } : t))
    setDraft('')
  }

  return (
    <div className="p-0 p-md-4 h-100">
      <div className="card shadow-sm border-0" style={{ minHeight: '60vh' }}>
        <div className="row g-0">
          {/* Left: conversations */}
          <div className="col-12 col-md-4 border-end">
            <div className="p-3 border-bottom fw-semibold">Conversations</div>
            <div className="list-group list-group-flush">
              {threads.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${active.id === t.id ? 'active' : ''}`}
                  onClick={() => setActiveId(t.id)}
                >
                  <img src={t.user.avatar} alt={t.user.name} className="rounded-circle" width="32" height="32" />
                  <span>{t.user.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: chat window */}
          <div className="col-12 col-md-8 d-flex flex-column">
            <div className="p-3 border-bottom d-flex align-items-center gap-2">
              <img src={active.user.avatar} alt={active.user.name} className="rounded-circle" width="32" height="32" />
              <div className="fw-semibold">{active.user.name}</div>
            </div>

            <div className="flex-grow-1 p-3 overflow-auto" style={{ maxHeight: '50vh' }}>
              {active.messages.map((m) => (
                <div key={m.id} className={`d-flex ${m.fromMe ? 'justify-content-end' : 'justify-content-start'} mb-2`}>
                  <div className={`px-3 py-2 rounded-3 shadow-sm ${m.fromMe ? 'bg-primary text-white' : 'bg-body-secondary'}`}>{m.text}</div>
                </div>
              ))}
            </div>

            <div className="p-3 border-top d-flex gap-2">
              <input className="form-control" placeholder="Type a message" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send() }} />
              <button className="btn btn-primary" onClick={send}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat


