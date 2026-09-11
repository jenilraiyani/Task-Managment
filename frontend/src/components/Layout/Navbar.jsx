import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import { useSearch } from '../../context/SearchContext';

const titles = {
  dashboard: 'Dashboard',
  tasks: 'All Tasks',
  today: 'Today',
  upcoming: 'Upcoming',
  completed: 'Completed',
  overdue: 'Overdue',
  'add-task': 'New Task',
};

const Navbar = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { query, setQuery } = useSearch();
  const path = location.pathname.substring(1) || 'dashboard';
  const title = titles[path] || path.charAt(0).toUpperCase() + path.slice(1);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearchFocusOrSubmit = () => {
    if (location.pathname === '/dashboard' || location.pathname === '/') {
      navigate('/tasks');
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchFocusOrSubmit();
    }
  };

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-3">
        <button className="mobile-toggle" onClick={toggleSidebar} aria-label="Open menu">
          <i className="bi bi-list"></i>
        </button>
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="navbar-right">
        <div className="search-box search-desktop">
          <i className="bi bi-search"></i>
          <input
            type="search"
            placeholder="Search tasks..."
            value={query}
            onChange={handleSearchChange}
            onFocus={handleSearchFocusOrSubmit}
            onKeyDown={handleSearchKeyDown}
            aria-label="Global search tasks"
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>

        <button
          className="mobile-search-toggle"
          onClick={() => setMobileSearchOpen(true)}
          aria-label="Open search"
        >
          <i className="bi bi-search"></i>
        </button>

        <ThemeToggle />
        <NotificationBell />
      </div>

      {mobileSearchOpen && (
        <div className="mobile-search-overlay">
          <div className="mobile-search-bar">
            <i className="bi bi-search"></i>
            <input
              type="search"
              placeholder="Search tasks..."
              value={query}
              onChange={handleSearchChange}
              onFocus={handleSearchFocusOrSubmit}
              onKeyDown={handleSearchKeyDown}
              autoFocus
              aria-label="Global search tasks"
            />
            <button
              type="button"
              className="mobile-search-close"
              onClick={() => setMobileSearchOpen(false)}
              aria-label="Close search"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
