import React, { useState, useRef, useEffect } from 'react'

function TagInput({ label, placeholder = 'Add a skill...', value = [], onChange, suggestions = [], disabled = false }) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Filter suggestions based on input
  useEffect(() => {
    if (input.trim()) {
      const filtered = suggestions.filter(
        suggestion => 
          suggestion.toLowerCase().includes(input.toLowerCase()) && 
          !value.includes(suggestion)
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
      setActiveSuggestion(-1)
    } else {
      setShowSuggestions(false)
      setFilteredSuggestions([])
    }
  }, [input, suggestions, value])

  const addTag = (tagToAdd = null) => {
    const next = (tagToAdd || input).trim()
    if (!next) return
    if (value.includes(next)) {
      setInput('')
      setShowSuggestions(false)
      return
    }
    onChange?.([...value, next])
    setInput('')
    setShowSuggestions(false)
    setActiveSuggestion(-1)
  }

  const removeTag = (tag) => {
    onChange?.(value.filter((t) => t !== tag))
  }

  const onKeyDown = (e) => {
    if (disabled) return
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (showSuggestions && filteredSuggestions.length > 0) {
        setActiveSuggestion(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        )
      }
    }
    
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (showSuggestions && filteredSuggestions.length > 0) {
        setActiveSuggestion(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        )
      }
    }
    
    if (e.key === 'Enter') {
      e.preventDefault()
      if (showSuggestions && activeSuggestion >= 0) {
        addTag(filteredSuggestions[activeSuggestion])
      } else {
        addTag()
      }
    }
    
    if (e.key === 'Escape') {
      setShowSuggestions(false)
      setActiveSuggestion(-1)
    }
    
    if (e.key === 'Backspace' && !input && value.length) {
      removeTag(value[value.length - 1])
    }
  }

  const selectSuggestion = (suggestion) => {
    addTag(suggestion)
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
          suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
        setActiveSuggestion(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="position-relative">
      {label && <label className="form-label">{label}</label>}
      <div className="d-flex gap-2">
        <div className="flex-grow-1 position-relative">
          <input
            ref={inputRef}
            className="form-control"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
          />
          
          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="position-absolute w-100 border border-secondary-subtle rounded shadow-sm mt-1"
              style={{ 
                zIndex: 1000, 
                maxHeight: '200px', 
                overflowY: 'auto',
                backgroundColor: 'var(--sb-sidebar-bg)',
                borderColor: 'var(--sb-border-color)'
              }}
            >
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  className={`px-3 py-2 cursor-pointer ${
                    index === activeSuggestion ? 'bg-primary text-white' : ''
                  }`}
                  onClick={() => selectSuggestion(suggestion)}
                  onMouseEnter={() => setActiveSuggestion(index)}
                  style={{ 
                    cursor: 'pointer',
                    backgroundColor: index === activeSuggestion ? 'var(--bs-primary)' : 'transparent',
                    color: index === activeSuggestion ? 'white' : 'inherit'
                  }}
                  onMouseLeave={() => index === activeSuggestion && setActiveSuggestion(-1)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        <button 
          type="button" 
          className="btn btn-primary" 
          onClick={() => addTag()}
          disabled={disabled || !input.trim()}
        >
          Add
        </button>
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
              disabled={disabled}
            />
          </span>
        ))}
      </div>
    </div>
  )
}

export default TagInput