import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/NotificationPanel.css';

function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDate();
    

    axios.get('http://localhost:5000/api/mou/filter')
  .then((res) => {
    const data = res.data;
    const newNotifs = [];

    // Monthly reminder
    if (currentDay === 1) {
      newNotifs.push('🔔 Monthly Reminder: Add activity updates.');
    }

    // General new MOU entry reminder
    newNotifs.push('📌 Remember to add new MOU entries if signed.');

    // Check for expiry
    data.forEach((mou) => {
      const addedDate = new Date(mou.AddedDate);
      const durationMonths = parseInt(mou.Duration);

      if (isNaN(durationMonths) || !addedDate) return;

      const expiryDate = new Date(addedDate);
      expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

      const daysLeft = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));

      if (daysLeft <= 30 && daysLeft >= 0) {
        newNotifs.push(`⏳ MOU with ${mou.Institute} is expiring on ${expiryDate.toDateString()}`);
      }
    });

    setNotifications(newNotifs);
  })
  .catch(() => {
    setNotifications(['❌ Failed to load notifications.']);
  });
  }, []);

  return (
    <div className="notif-panel">
      <h3>Notifications</h3>
      <ul>
        {notifications.length > 0 ? notifications.map((n, idx) => (
          <li key={idx}>{n}</li>
        )) : (
          <li>No notifications available.</li>
        )}
      </ul>
    </div>
  );
}

export default NotificationPanel;
