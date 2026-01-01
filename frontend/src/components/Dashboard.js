import React, { useState, useEffect } from 'react';
import { mouAPI } from '../utils/api';
import MOUForm from './MOUForm';
import FilterDownload from './FilterDownload';
import Notification from './Notification';
import '../styles/Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await mouAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">MOU Dashboard</h1>
      
      {/* Statistics Cards */}
      {!loading && stats && (
        <div className="stats-container">
          <div className="stat-card">
            <h3>Total MOUs</h3>
            <p className="stat-number">{stats.total_mous || 0}</p>
          </div>
          <div className="stat-card active">
            <h3>Active MOUs</h3>
            <p className="stat-number">{stats.active_mous || 0}</p>
          </div>
          <div className="stat-card expired">
            <h3>Expired MOUs</h3>
            <p className="stat-number">{stats.expired_mous || 0}</p>
          </div>
          <div className="stat-card expiring">
            <h3>Expiring Soon (30 days)</h3>
            <p className="stat-number">{stats.expiring_soon || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Unique Faculties</h3>
            <p className="stat-number">{stats.unique_faculties || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Unique Institutes</h3>
            <p className="stat-number">{stats.unique_institutes || 0}</p>
          </div>
        </div>
      )}
      
      <Notification />
      <MOUForm />
      <FilterDownload />
    </div>
  );
}

export default Dashboard;
