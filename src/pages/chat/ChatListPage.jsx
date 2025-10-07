// src/pages/chat/ChatListPage.jsx
import React, { useState, useEffect, useContext, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { AuthContext } from "../../context/AuthLocket";
import { createResolveUserInfo } from "../UILocket/ExtendPage/components/resolveUserInfo";
import Listmsg from "./components/Listmsg";

export default function ChatListPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { friendDetails, user } = useContext(AuthContext);

  const resolveUserInfo = useMemo(
    () => createResolveUserInfo(friendDetails, user),
    [friendDetails, user]
  );

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const token =
          localStorage.getItem("authToken") || localStorage.getItem("idToken");

        if (!token) throw new Error("Chưa đăng nhập. Vui lòng đăng nhập lại.");

        const response = await fetch(
          "http://localhost:8000/locket/getAllMessageV2",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ timestamp: null }),
          }
        );

        if (!response.ok) {
          if (response.status === 401)
            throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          throw new Error("Không thể tải tin nhắn");
        }

        const data = await response.json();

        const transformedMessages = data.data.map((item) => {
        const resolved = resolveUserInfo(item.with_user);
        const userName = resolved?.name || item.with_user || "Người dùng";

        const avatarUrl =
          resolved?.avatar ||
          resolved?.avatar_url ||
          resolved?.photoURL ||
          resolved?.profilePicture ||
          resolved?.image ||
          item.avatar ||
          item.avatar_url ||
          "/prvlocket.png";

          return {
            id: item.uid,
            name: userName,
            avatarText: userName.substring(0, 2).toUpperCase(),
            avatarImage: avatarUrl,
            lastMessage: item.latestMessage?.body || "",
            time: item.latestMessage?.createdAt || item.updateTime,
            unreadCount: item.unreadCount || 0,
            sender: item.sender,
            withUser: item.with_user,
            rawData: item,
          };
        });

        transformedMessages.sort(
          (a, b) => parseInt(b.time) - parseInt(a.time)
        );

        setMessages(transformedMessages);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [resolveUserInfo]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-base-100 text-base-content transition-colors duration-300">
      {/* Danh sách tin nhắn */}
      <div
        className={`absolute inset-0 transition-transform duration-500 flex flex-col ${
          selectedChat ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <div className="flex items-center gap-4 p-4 border-b border-base-300 bg-base-200/50 backdrop-blur">
          <button
            onClick={() => window.history.back()}
            className="hover:bg-base-300 rounded-lg p-2 transition-colors inline-flex items-center"
          >
            <ArrowLeft size={26} />
          </button>
          <h1 className="text-xl font-semibold">Tin nhắn</h1>
          {messages.length > 0 && (
            <span className="ml-auto text-sm text-gray-500">
              {messages.length} cuộc trò chuyện
            </span>
          )}
        </div>

        {error ? (
          <div className="flex-1 flex items-center justify-center text-red-5000 p-4">
            <div className="text-center">
              <p className="mb-2">❌ Mất kết nối với máy chủ ( {error} )</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-blue-500 underline"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : (
          <Listmsg messages={messages} onSelect={setSelectedChat} loading={loading} />
        )}
      </div>

      {/* Chi tiết chat */}
      <div
        className={`absolute inset-0 transition-transform duration-500 ${
          selectedChat ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedChat && (
          <>
            <div className="flex items-center gap-4 p-4 border-b border-base-300 bg-base-200/50 backdrop-blur">
              <button
                onClick={() => setSelectedChat(null)}
                className="hover:bg-base-300 rounded-lg p-2 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center gap-3">
                {selectedChat.avatarImage ? (
                  <img
                    src={selectedChat.avatarImage}
                    alt={selectedChat.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-semibold">
                    {selectedChat.avatarText}
                  </div>
                )}
                <h1 className="text-xl font-semibold">{selectedChat.name}</h1>
              </div>
            </div>

            <div className="flex flex-col h-[calc(100vh-64px)]">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="text-base-content/60 text-center mt-4">
                  💬 Bắt đầu chat với <b>{selectedChat.name}</b>
                </div>

                {selectedChat.lastMessage && (
                  <div className="flex justify-start">
                    <div className="bg-base-300 px-3 py-2 rounded-lg max-w-[70%]">
                      {selectedChat.lastMessage}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-base-300 p-3 flex bg-base-200/30">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-base-100 rounded-lg px-3 py-2 outline-none border border-base-300"
                />
                <button className="ml-3 bg-primary text-primary-content px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition">
                  Gửi
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
