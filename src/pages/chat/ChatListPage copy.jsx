import React, { useState, useEffect, useContext, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { AuthContext } from "../../context/AuthLocket";
import { createResolveUserInfo } from "../UILocket/ExtendPage/components/resolveUserInfo";
import Listmsg from "./components/Listmsg";
import { useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:8000"); // hoặc URL server WebSocket của bạn


export default function ChatListPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatMessages, setChatMessages] = useState([]); // <== thêm state này
  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState(null);
  const { friendDetails, user } = useContext(AuthContext);

  const resolveUserInfo = useMemo(
    () => createResolveUserInfo(friendDetails, user),
    [friendDetails, user]
  );

  // ======= GỌI DANH SÁCH CUỘC TRÒ CHUYỆN =======
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
          throw new Error("Không thể tải danh sách tin nhắn");
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
            uid: item.uid,
            name: userName,
            avatarText: userName.substring(0, 2).toUpperCase(),
            avatarImage: avatarUrl,
            lastMessage: item.latestMessage?.body || "",
            time: item.latestMessage?.createdAt || item.updateTime,
            unreadCount: item.unreadCount || 0,
            sender: item.sender,
            withUser: item.with_user,
          };
        });

        transformedMessages.sort(
          (a, b) => parseInt(b.time) - parseInt(a.time)
        );

        setMessages(transformedMessages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [resolveUserInfo]);






  //cuộn xuống cuối mỗi khi có tin nhắn mới
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);
  useEffect(() => {
    if (!selectedChat) return;

    const token =
      localStorage.getItem("authToken") || localStorage.getItem("idToken");

    // Gửi yêu cầu mở stream gRPC qua WebSocket
    socket.emit("chatWithUserV2", {
      token,
      messageId: selectedChat.uid,
      timestamp: null,
    });

    // Lắng nghe tin nhắn mới
    socket.on("NEW_MESSAGE_WITH_USER", (newMessages) => {
      setChatMessages((prev) => [...prev, ...newMessages]);
    });

    // Cleanup khi unmount hoặc đổi selectedChat
    return () => {
      socket.off("NEW_MESSAGE_WITH_USER");
    };
  }, [selectedChat]);












  // ======= GỌI CHI TIẾT CUỘC TRÒ CHUYỆN =======
  useEffect(() => {
    const fetchChatDetail = async () => {
      if (!selectedChat) return;
      try {
        setLoadingChat(true);
        const token =
          localStorage.getItem("authToken") || localStorage.getItem("idToken");
        const response = await fetch(
          "http://localhost:8000/locket/getMessageWithUserV2",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              messageId: selectedChat.uid,
              timestamp: null,
            }),
          }
        );

        if (!response.ok) throw new Error("Không thể tải tin nhắn chi tiết");

        const data = await response.json();
        setChatMessages((data.data || []).reverse());
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingChat(false);
      }
    };

    fetchChatDetail();
  }, [selectedChat]);

  // ======= GIAO DIỆN =======
  return (
    <div className="relative min-h-screen overflow-hidden bg-base-100 text-base-content transition-colors duration-300">
      {/* DANH SÁCH TIN NHẮN */}
      <div
        className={`absolute inset-0 transition-transform duration-500 flex flex-col ${
          selectedChat ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <div className="flex items-center gap-4 p-4 border-b border-base-300 bg-base-200/50 backdrop-blur">
          <h1 className="text-xl font-semibold">Tin nhắn</h1>
        </div>

        {error ? (
          <div className="flex-1 flex items-center justify-center text-red-500">{error}</div>
        ) : (
          <Listmsg messages={messages} onSelect={setSelectedChat} loading={loading} />
        )}
      </div>

      {/* CHI TIẾT CHAT */}
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
                <img
                  src={selectedChat.avatarImage}
                  alt={selectedChat.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <h1 className="text-xl font-semibold">{selectedChat.name}</h1>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingChat ? (
                <div className="text-center text-gray-500">Đang tải tin nhắn...</div>
              ) : (
                <>
                  {chatMessages.map((msg) => {
                    const isOwn = msg.sender === user?.uid;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`px-3 py-2 rounded-lg max-w-[70%] ${
                            isOwn ? "bg-primary text-primary-content" : "bg-base-300"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </>
              )}



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
