import { useEffect, useState } from 'react';
import { mouAPI } from '../utils/api';

function Notification() {
  const [expiringMous, setExpiringMous] = useState([]);

  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDate();

    // Show reminder only on the 1st of every month
    if (currentDay === 1) {
      alert("🔔 Monthly Reminder: Please enter MOU activities for this month!");
    }

    // Fetch expiring MOUs (next 60 days)
    fetchExpiringMous();
  }, []);

  const fetchExpiringMous = async () => {
    try {
      const data = await mouAPI.getExpiring(60); // MOUs expiring in next 60 days
      setExpiringMous(data);
      handleNotifications(data);
    } catch (error) {
      console.error("Failed to fetch expiring MOUs:", error);
    }
  };

  const handleNotifications = (data) => {
    if (data.length > 0) {
      const mouList = data.map(mou => 
        `• ${mou.institute} (Expires: ${new Date(mou.expiry_date).toLocaleDateString()}, ${mou.days_remaining} days left)`
      ).join('\n');
      
      alert(`⏳ ${data.length} MOU(s) expiring soon:\n\n${mouList}\n\nConsider renewal actions.`);
    }
  };

  return null;
}

export default Notification;
