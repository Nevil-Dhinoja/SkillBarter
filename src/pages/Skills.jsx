import React, { useState } from 'react'
import TagInput from '../components/TagInput'

function Skills() {
  const [teach, setTeach] = useState(['Photoshop', 'Python'])
  const [learn, setLearn] = useState(['Guitar', 'Cooking'])

  return (
    <div className="p-4 p-md-5">
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h2 className="h5 mb-3">Skills I Can Teach</h2>
              <TagInput value={teach} onChange={setTeach} placeholder="Add a skill to teach..." />
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h2 className="h5 mb-3">Skills I Want to Learn</h2>
              <TagInput value={learn} onChange={setLearn} placeholder="Add a skill to learn..." />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Skills


