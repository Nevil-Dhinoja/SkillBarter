import React, { useState } from 'react'

const MOCK_MATCHES = [
  {
    id: '1',
    name: 'Ava Carter',
    avatar: 'https://i.pravatar.cc/80?img=32',
    teaches: ['Photoshop', 'Illustrator'],
    learns: ['Cooking'],
  },
  {
    id: '2',
    name: 'Noah Singh',
    avatar: 'https://i.pravatar.cc/80?img=12',
    teaches: ['Guitar'],
    learns: ['Python'],
  },
  {
    id: '3',
    name: 'Mia Chen',
    avatar: 'https://i.pravatar.cc/80?img=5',
    teaches: ['Python', 'Data Viz'],
    learns: ['Guitar', 'Singing'],
  },
]

function Matches({ onStartChat }) {
  const [query, setQuery] = useState('')
  const results = MOCK_MATCHES.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="p-4 p-md-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5 mb-0">Matches</h2>
        <input className="form-control" style={{ maxWidth: 280 }} placeholder="Search matches..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="row g-3">
        {results.map((m) => (
          <div className="col-12 col-md-6 col-xl-4" key={m.id}>
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body d-flex gap-3 align-items-start">
                <img src={m.avatar} alt={m.name} className="rounded-circle" width="48" height="48" />
                <div className="flex-grow-1">
                  <div className="fw-semibold mb-1">{m.name}</div>
                  <div className="small text-secondary mb-2">
                    Teaches: {m.teaches.join(', ')} • Learning: {m.learns.join(', ')}
                  </div>
                  <button className="btn btn-outline-primary btn-sm" onClick={() => onStartChat(m)}>Start Chat</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Matches


