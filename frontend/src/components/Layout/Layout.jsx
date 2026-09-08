import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { SearchProvider } from '../../context/SearchContext';
import '../../styles/layout.css';
import '../../styles/components.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SearchProvider>
      <div className="app-container">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />

        <div className="main-content">
          <Navbar toggleSidebar={() => setSidebarOpen(true)} />
          <div className="page-content">
            <Outlet />
          </div>
        </div>

        {sidebarOpen && (
          <div
            className="sidebar-overlay d-md-none"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </SearchProvider>
  );
};

export default Layout;
