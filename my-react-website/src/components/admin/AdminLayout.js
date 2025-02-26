import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/admin/AdminLayout.css';

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: 'fas fa-chart-line', label: 'Dashboard' },
    { path: '/admin/blog', icon: 'fas fa-blog', label: 'Blog' },
    { path: '/admin/models', icon: 'fas fa-users', label: 'Models' },
    { path: '/admin/applications', icon: 'fas fa-file-alt', label: 'Applications' },
    { path: '/admin/bookings', icon: 'fas fa-calendar', label: 'Bookings' },
    { path: '/admin/settings', icon: 'fas fa-cog', label: 'Settings' }
  ];

  return (
    <div className="admin-layout">
      <div className={`admin-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <h2>MIKXX Admin</h2>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`}></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="admin-content">
        <div className="admin-topbar">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search..." />
          </div>
          <div className="topbar-actions">
            <button className="notification-btn">
              <i className="fas fa-bell"></i>
              <span className="badge">3</span>
            </button>
            <div className="admin-profile">
              <img src="https://via.placeholder.com/40" alt="Admin" />
              <span>Admin</span>
            </div>
          </div>
        </div>
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AdminLayout; 