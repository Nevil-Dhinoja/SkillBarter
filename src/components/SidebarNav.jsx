import React from 'react'

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { key: 'profile', label: 'Profile', icon: 'bi-person-circle' },
  { key: 'skills', label: 'My Skills', icon: 'bi-stars' },
  { key: 'matches', label: 'Matches', icon: 'bi-people' },
  { key: 'quizzes', label: 'Quizzes', icon: 'bi-clipboard-check' },
  { key: 'feedback', label: 'Feedback', icon: 'bi-chat-dots' },
  { key: 'settings', label: 'Settings', icon: 'bi-gear' },
]

function SidebarNav({ activeKey, onSelect }) {
  return (
    <ul className="nav nav-pills flex-column gap-1">
      {menuItems.map((item) => (
        <li className="nav-item" key={item.key}>
          <a
            href={`#${item.key}`}
            className={`nav-link w-100 text-start d-flex align-items-center gap-2 ${
              activeKey === item.key ? 'active' : ''
            }`}
            onClick={() => onSelect(item.key)}
          >
            <i className={`bi ${item.icon}`} aria-hidden="true" />
            <span>{item.label}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export default SidebarNav


