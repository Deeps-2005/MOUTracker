import { useEffect, useState } from 'react';
import axios from 'axios';

function Notification() {
  const [mous, setMous] = useState([]);

  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDate();

    // Show reminder only on the 1st of every month
    if (currentDay === 1) {
      alert("🔔 Monthly Reminder: Please enter MOU activities for this month!");

      // Fetch MOU data to check for renewals or new entries
      axios.get('http://localhost:5000/api/mou/filter')
        .then(response => {
          setMous(response.data);
          handleNotifications(response.data);
        })
        .catch(() => {
          console.error("Failed to fetch MOU data");
        });
    }
  }, []);

  const handleNotifications = (data) => {
    const now = new Date();

    data.forEach(mou => {
      const durationYears = parseInt(mou.Duration); // assumes Duration is like '1', '2'
      const startYear = parseInt(mou.AcademicYear.split('-')[0]);
      const endYear = startYear + durationYears;
      const endDate = new Date(endYear, 4); // MOU expiry assumed in May

      // Check for MOU renewal reminders
      const timeToExpire = (endDate - now) / (1000 * 60 * 60 * 24); // days left

      if (timeToExpire <= 60 && timeToExpire > 0) {
        alert(`⏳ Reminder: MOU with ${mou.Institute} is expiring soon. Consider renewal.`);
      }

      // Optionally, alert for new MOU based on creation date logic
      // Or show alert if activity logs are missing (if you track that)
    });
  };

  return null;
}

export default Notification;
