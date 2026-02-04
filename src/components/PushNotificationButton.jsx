// src/components/PushNotificationButton.js
import React, { useEffect } from 'react';
import { subscribeToPushNotifications } from '../services/serviceWorker/pushSubscription';

const PushNotificationButton = () => {

  useEffect(() => {
    const handleSubscription = async () => {
      try {
        if ('Notification' in window && 'serviceWorker' in navigator) {
          // Xin quyền ngay lập tức khi component được mount (theo logic cũ của user mong muốn)
          const permission = await Notification.requestPermission();

          if (permission === 'granted') {
            // Nếu đã cấp quyền, thực hiện subscribe để gửi token lên server
            // Hàm subscribeToPushNotifications đã có logic check duplicate, user ko cần lo
            console.log('Permission granted, attempting to subscribe...');
            await subscribeToPushNotifications();
          }
        }
      } catch (error) {
        console.error('Error in PushNotificationButton auto-subscribe:', error);
      }
    };

    handleSubscription();
  }, []);

  // Component này không cần render gì cả, chỉ chạy logic ngầm
  return (
    <div className='hidden'>
    </div>
  );
};

export default PushNotificationButton;
