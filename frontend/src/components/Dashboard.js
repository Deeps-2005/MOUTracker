import React from 'react';
import MOUForm from './MOUForm';
import FilterDownload from './FilterDownload';
import Notification from './Notification';
import '../styles/Dashboard.css';


function Dashboard() {
  return (
    <div className="dashboard-container">
        <h1 className="dashboard-title">MOU Dashboard</h1>
        <Notification />
        <MOUForm />
        <FilterDownload />
    </div>
  );
}

export default Dashboard;
