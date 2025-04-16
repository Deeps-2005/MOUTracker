import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <nav className="navbar">
      <h3>MOU Tracker</h3>
      <div className="nav-links">
        <Link to="/home">HOME</Link>
        <Link to="/add">ADD MOU</Link>
        <Link to="/search">DASHBOARD</Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
