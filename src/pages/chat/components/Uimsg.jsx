// src/pages/chat/components/Uimsg.jsx
import React from "react";

const Uimsg = ({ name, avatarText, avatarImage, lastMessage, time, unreadCount, onClick }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(parseInt(timestamp) * 1000);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 hover:bg-gray-900 cursor-pointer transition-colors border-b border-base-300"
    >
      <div className="relative flex-shrink-0">
        {avatarImage ? (
          <img src={avatarImage} alt={name} className="w-14 h-14 rounded-full object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-lg font-semibold">
            {avatarText}
          </div>
        )}

        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="text-base-content text-lg font-normal truncate">{name}</h3>
          <span className="text-gray-500 text-xs ml-2 flex-shrink-0">{formatTime(time)}</span>
        </div>
        <p className="text-gray-500 text-sm truncate">{lastMessage || "Chưa có tin nhắn nào"}</p>
      </div>
    </div>
  );
};

export default Uimsg;
