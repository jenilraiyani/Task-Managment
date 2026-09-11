import { NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/layout.css';

const links = [
  { to: '/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
  { to: '/tasks', icon: 'bi-list-check', label: 'All Tasks' },
  { to: '/today', icon: 'bi-sun', label: 'Today' },
  { to: '/upcoming', icon: 'bi-calendar3', label: 'Upcoming' },
  { to: '/completed', icon: 'bi-check2-circle', label: 'Completed' },
  { to: '/overdue', icon: 'bi-exclamation-octagon', label: 'Overdue' },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-mark" style={{ background: 'transparent', padding: 0 }}>
          <img src="/logo.png" alt="Taskora Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div>
          <h3>Taskora</h3>
          <span className="brand-sub">Priority studio</span>
        </div>
      </div>

      <div className="sidebar-nav-scroll">
        <div className="sidebar-section-title">Workspace</div>
        <nav className="nav flex-column">
          {links.map((link) => (
            <div className="nav-item" key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={toggleSidebar}
              >
                <i className={`bi ${link.icon}`}></i> {link.label}
              </NavLink>
            </div>
          ))}
        </nav>
      </div>

      <div className="user-profile">
        <div className="avatar">
          {(user?.name || user?.Name || user?.email || user?.Email || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <span className="user-name">{user?.name || user?.Name || 'User'}</span>
          <span className="user-email">{user?.email || user?.Email || ''}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout" aria-label="Logout">
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
