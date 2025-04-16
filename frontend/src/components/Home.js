import React, { useState } from 'react';
import Navbar from './Navbar';
import NotificationPanel from './NotificationPanel';
import '../styles/Home.css';
import '../styles/Sidebar.css';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    // Auto-show notifications when opening sidebar
    if (!isSidebarOpen) setShowNotifications(true);
  };
  const navigate = useNavigate();

  const goToAdd = () => navigate('/add');
  const goToSearch = () => navigate('/search');
  const logout = () => {
    // You can clear sessionStorage/localStorage if used
    navigate('/');
  };

  return (
    <>
      <Navbar />
      <div className="home-layout">
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="menu-icon" onClick={toggleSidebar}>
            ☰
          </div>

          {isSidebarOpen && (
            <div className="sidebar-content">
              <button onClick={() => setShowNotifications(!showNotifications)}>
                🔔 Notifications
              </button>

              {showNotifications && <NotificationPanel />}
            </div>
          )}
        </aside>

        <main className="main-content">
          <h2>Welcome to MOU Tracker</h2>
          <div className="home-buttons">
            <button onClick={goToAdd}>➕ Add MOU</button>
            <button onClick={goToSearch}>🔍 Search and Edit MOU</button>
            <button onClick={logout}>🚪 Logout</button>
          </div>
        </main>
      </div>
    </>
  );
}

export default Home;
