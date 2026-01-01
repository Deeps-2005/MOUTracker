import React, { useEffect, useState } from 'react';
import { mouAPI } from '../utils/api';
import '../styles/NotificationPanel.css';

function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const currentDay = today.getDate();
      const newNotifs = [];

      // Monthly reminder
      if (currentDay === 1) {
        newNotifs.push('🔔 Monthly Reminder: Add activity updates and review MOUs.');
      }

      // General new MOU entry reminder
      newNotifs.push('📌 Remember to add new MOU entries if signed.');

      // Fetch expiring MOUs (next 30 days)
      const expiringMous = await mouAPI.getExpiring(30);
      
      if (expiringMous && expiringMous.length > 0) {
        expiringMous.forEach((mou) => {
          const expiryDate = new Date(mou.expiry_date);
          const daysLeft = mou.days_remaining;
          
          newNotifs.push(
            `⏳ MOU with ${mou.institute} is expiring on ${expiryDate.toDateString()} (${daysLeft} days left)`
          );
        });
      } else {
        newNotifs.push('✅ No MOUs expiring in the next 30 days.');
      }

      // Fetch statistics for additional insights
      const stats = await mouAPI.getStats();
      if (stats.expired_mous > 0) {
        newNotifs.push(`⚠️ You have ${stats.expired_mous} expired MOU(s) that need attention.`);
      }

      setNotifications(newNotifs);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications(['❌ Failed to load notifications. Please check your connection.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notif-panel">
      <h3>Notifications</h3>
      {loading ? (
        <p style={{ padding: '10px', color: '#666' }}>Loading notifications...</p>
      ) : (
        <ul>
          {notifications.length > 0 ? notifications.map((n, idx) => (
            <li key={idx}>{n}</li>
          )) : (
            <li>No notifications available.</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default NotificationPanel;
