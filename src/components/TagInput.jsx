import React, { useState } from 'react'

function TagInput({ label, placeholder = 'Add a skill...', value = [], onChange }) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const next = input.trim()
    if (!next) return
    if (value.includes(next)) return setInput('')
    onChange?.([...value, next])
    setInput('')
  }

  const removeTag = (tag) => {
    onChange?.(value.filter((t) => t !== tag))
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
    if (e.key === 'Backspace' && !input && value.length) {
      removeTag(value[value.length - 1])
    }
  }

  return (
    <div>
      {label && <label className="form-label">{label}</label>}
      <div className="d-flex gap-2">
        <input
          className="form-control"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
        />
        <button type="button" className="btn btn-primary" onClick={addTag}>Add</button>
      </div>
      <div className="mt-2 d-flex flex-wrap gap-2">
        {value.map((tag) => (
          <span key={tag} className="badge rounded-pill text-bg-secondary tag-pill">
            {tag}
            <button
              type="button"
              className="btn-close btn-close-white btn-sm ms-2"
              aria-label={`Remove ${tag}`}
              onClick={() => removeTag(tag)}
              style={{ transform: 'scale(.75)' }}
            />
          </span>
        ))}
      </div>
    </div>
  )
}

export default TagInput


