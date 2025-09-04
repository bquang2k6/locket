import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../utils";

const highlightWords = ["Server01", "Telegram"];

function parseMessage(text, highlightWords = []) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-semibold underline"
        >
          {part}
        </a>
      );
    }
    let lastIndex = 0;
    const elements = [];

    highlightWords.forEach((word) => {
      const lowerPart = part.toLowerCase();
      const lowerWord = word.toLowerCase();

      let startIndex = 0;
      while (true) {
        const index = lowerPart.indexOf(lowerWord, startIndex);
        if (index === -1) break;

        if (index > lastIndex) {
          elements.push(part.substring(lastIndex, index));
        }
        elements.push(
          <strong key={`${i}-${index}`} className="text-red-600 font-semibold">
            {part.substring(index, index + word.length)}
          </strong>
        );

        lastIndex = index + word.length;
        startIndex = lastIndex;
      }
    });

    if (elements.length === 0) {
      return <React.Fragment key={i}>{part}</React.Fragment>;
    }

    elements.push(part.substring(lastIndex));
    return <React.Fragment key={i}>{elements}</React.Fragment>;
  });
}

const PopupNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [showList, setShowList] = useState(false);
  const [isShaking, setIsShaking] = useState(true);
  const [showNewNotificationAlert, setShowNewNotificationAlert] = useState(false);
  const [isHiddenFor2Hours, setIsHiddenFor2Hours] = useState(false);

  // Kiểm tra xem có đang bị ẩn trong 2h không khi component mount
  useEffect(() => {
    const hiddenUntil = localStorage.getItem('notification_hidden_until');
    if (hiddenUntil) {
      const hiddenTime = new Date(hiddenUntil);
      const now = new Date();
      if (now < hiddenTime) {
        setIsHiddenFor2Hours(true);
        // Set timeout để tự động hiện lại khi hết thời gian
        const remainingTime = hiddenTime.getTime() - now.getTime();
        setTimeout(() => {
          setIsHiddenFor2Hours(false);
          localStorage.removeItem('notification_hidden_until');
        }, remainingTime);
      } else {
        localStorage.removeItem('notification_hidden_until');
      }
    }
  }, []);

  useEffect(() => {
    // Không fetch notifications nếu đang bị ẩn trong 2h
    if (isHiddenFor2Hours) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${API_URL.NOTIFI_URL}`);
        const data = Array.isArray(res.data.notifications)
          ? res.data.notifications
          : [];

        const formatted = data.map((item) => ({
          ...item,
          time: new Date(item.created_at).toLocaleString(),
        }));

        if (formatted.length > 0) {
          setShowNewNotificationAlert(true);
          // Tự động mở bảng thông báo khi có thông báo mới
          setShowList(true);
          setTimeout(() => setShowNewNotificationAlert(false), 2000);
        }

        setNotifications(formatted);
      } catch (err) {
        console.error("Lỗi khi lấy thông báo:", err);
      }
    };

    fetchNotifications();

    const timer = setTimeout(() => setIsShaking(false), 2000);
    return () => clearTimeout(timer);
  }, [isHiddenFor2Hours]);

  const toggleList = () => {
    setShowList(!showList);
  };

  const hideFor2Hours = () => {
    const hiddenUntil = new Date();
    hiddenUntil.setHours(hiddenUntil.getHours() + 2);
    localStorage.setItem('notification_hidden_until', hiddenUntil.toISOString());
    
    setIsHiddenFor2Hours(true);
    setShowList(false);
    setShowNewNotificationAlert(false);
    
    // Tự động hiện lại sau 2h
    setTimeout(() => {
      setIsHiddenFor2Hours(false);
      localStorage.removeItem('notification_hidden_until');
    }, 2 * 60 * 60 * 1000); // 2 giờ
  };

  // Tự động đóng bảng thông báo sau 10 giây (tuỳ chọn)
  useEffect(() => {
    if (showList && notifications.length > 0) {
      const autoCloseTimer = setTimeout(() => {
        setShowList(false);
      }, 10000); // 10 giây

      return () => clearTimeout(autoCloseTimer);
    }
  }, [showList, notifications.length]);

  // Không hiển thị gì nếu đang bị ẩn trong 2h
  if (isHiddenFor2Hours) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center text-base-content pointer-events-none">
      {/* Dòng thông báo mới xuất hiện trong 2s */}
      <div
        className={`absolute top-4 px-4 py-2 bg-green-500 text-white rounded shadow-md text-sm transition-all duration-500 transform pointer-events-auto ${
          showNewNotificationAlert
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        Có thông báo mới!
      </div>

      {/* Danh sách thông báo */}
      {notifications.length > 0 && (
        <div
          className={`w-80 bg-base-100 border shadow-lg rounded-lg overflow-hidden transform transition-all duration-300 ease-out pointer-events-auto ${
            showList ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="text-sm font-semibold px-4 py-2 border-b bg-base-200 flex justify-between items-center">
            <span>Thông báo mới</span>
            <button 
              onClick={toggleList}
              className="text-gray-500 hover:text-gray-700 text-lg"
            >
              ×
            </button>
          </div>
          <ul className="max-h-60 overflow-y-auto divide-y">
            {notifications.map((item) => (
              <li
                key={item.id}
                className="px-4 py-3 text-sm whitespace-pre-line break-words"
              >
                {item.title && (
                  <div className="font-semibold mb-1">{item.title}</div>
                )}
                <div>{parseMessage(item.message, highlightWords)}</div>
                <div className="text-xs text-gray-500">{item.time}</div>
              </li>
            ))}
          </ul>
          
          {/* Nút đóng trong 2h ở dưới cùng */}
          <div className="border-t bg-base-200 px-4 py-2">
            <button
              onClick={hideFor2Hours}
              className="w-full text-xs text-gray-600 hover:text-gray-800 py-1 hover:bg-gray-100 rounded transition-colors duration-200"
            >
              Đóng trong 2 giờ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopupNotification;