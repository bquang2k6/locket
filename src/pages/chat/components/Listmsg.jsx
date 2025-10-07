// src/pages/chat/components/Listmsg.jsx
import React from "react";
import { Loader2 } from "lucide-react";
import Uimsg from "./Uimsg";

const Listmsg = ({ messages, onSelect, loading }) => {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-500" size={32} />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Chưa có tin nhắn nào
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((msg) => (
        <Uimsg
          key={msg.id}
          name={msg.name}
          avatarText={msg.avatarText}
          avatarImage={msg.avatarImage}
          lastMessage={msg.lastMessage}
          time={msg.time}
          unreadCount={msg.unreadCount}
          onClick={() => onSelect(msg)}
        />
      ))}
    </div>
  );
};

export default Listmsg;
