import React from 'react'

function Topbar({ theme = 'light', onToggleTheme = () => {} }) {
  return (
    <div className="topbar bg-body border-bottom sticky-top">
      <div className="d-flex align-items-center gap-2 p-3">
        <form className="flex-grow-1" role="search" onSubmit={(e) => e.preventDefault()}>
          <input
            className="form-control top-search"
            type="search"
            placeholder="Search skills, people, or topics..."
            aria-label="Search"
          />
        </form>

        <button
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
          type="button"
          aria-label="Toggle theme"
          onClick={onToggleTheme}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          <i className={`bi ${theme === 'light' ? 'bi-moon-stars' : 'bi-sun'}`} />
        </button>

        <div className="dropdown">
          <button
            className={`btn ${theme === 'dark' ? 'btn-outline-light' : 'btn-light'} d-flex align-items-center gap-2 shadow-sm`}
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span className="avatar bg-primary text-white d-inline-flex align-items-center justify-content-center">
              <i className="bi bi-person" />
            </span>
            <span className="d-none d-sm-inline">Profile</span>
            <i className="bi bi-caret-down-fill small" />
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li><button className="dropdown-item" type="button">My Profile</button></li>
            <li><button className="dropdown-item" type="button">Settings</button></li>
            <li><hr className="dropdown-divider" /></li>
            <li><button className="dropdown-item" type="button">Logout</button></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Topbar


