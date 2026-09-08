import { useLocation, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { useSearch } from '../../context/SearchContext';

const titles = {
  dashboard: 'Dashboard',
  tasks: 'All Tasks',
  today: 'Today',
  upcoming: 'Upcoming',
  completed: 'Completed',
  overdue: 'Overdue',
};

const Navbar = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { query, setQuery } = useSearch();
  const path = location.pathname.substring(1) || 'dashboard';
  const title = titles[path] || path.charAt(0).toUpperCase() + path.slice(1);

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearchFocusOrSubmit = () => {
    // From dashboard, jump to All Tasks so global search has results
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
        <div className="search-box">
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
        <NotificationBell />
      </div>
    </header>
  );
};

export default Navbar;
