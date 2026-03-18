import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { AuthContext } from "../../context/AuthLocket";
import { createResolveUserInfo } from "../UILocket/ExtendPage/components/resolveUserInfo";
import Listmsg from "./components/Listmsg";
import { API_URL } from "../../utils/API/apiRoutes";
import * as utils from "../../utils";
import axios from "axios";
import { Link } from "react-router-dom";

import {
  onNewListMessages,
  onNewMessagesWithUser,
  emitGetListMessages,
  emitGetMessagesWithUser,
  getSocket,
} from "../../lib/socket";

// Import cache và services
import {
  getAllConversations,
  saveConversations,
  upsertConversations,
  getMessagesByConversationId,
  saveMessageWithUsers,
} from "../../cache/chatsDB";
import {
  GetAllMessage,
  getMessagesWithUser,
  sendMessage as sendMessageService,
  markReadMessage,
  sendReactionOnMessage,
} from "../../services/LocketWanService/ChatServices";
import {
  handleListMessage,
  handleListMessageWithUser,
  handleNewMessageWithUser,
} from "../../socket/socketHandlers";
import SocketStatus from "./components/SocketStatus";


export default function ChatListPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatMessages, setChatMessages] = useState([]); // <== thêm state này
  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false); // Trạng thái kết nối socket
  const { friendDetails, user } = useContext(AuthContext);
  const [newMessage, setNewMessage] = useState("");
  const [lastEnterTime, setLastEnterTime] = useState(0);
  const [activeReactionMsg, setActiveReactionMsg] = useState(null);
  const [avatarError, setAvatarError] = useState(false); // Track lỗi ảnh avatar
  const messagesEndRef = useRef(null); // ref để cuộn
    const pressTimerRef = useRef(null);

  const resolveUserInfo = useMemo(
    () => createResolveUserInfo(friendDetails, user),
    [friendDetails, user]
  );

  // ======= THEO DÕI TRẠNG THÁI KẾT NỐI SOCKET =======
  useEffect(() => {
    const socket = getSocket();
    
    // Lắng nghe sự kiện kết nối
    const handleConnect = () => {
      console.log("✅ Socket connected");
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    };

    const handleConnectError = (error) => {
      console.error("❌ Socket connection error:", error);
      setIsConnected(false);
    };

    // Kiểm tra trạng thái ban đầu
    setIsConnected(socket.connected);

    // Đăng ký listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    // Cleanup
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, []);

   useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // ======= GỌI DANH SÁCH CUỘC TRÒ CHUYỆN =======
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const token =
          localStorage.getItem("authToken") || localStorage.getItem("idToken");
        if (!token) throw new Error("Chưa đăng nhập. Vui lòng đăng nhập lại.");

        // 1. Lấy từ DB trước (cache)
        const localConversations = await getAllConversations();
        if (localConversations?.length > 0) {
          console.log("✅ Loaded from DB:", localConversations.length);
          // Transform để hiển thị
          const transformed = localConversations.map((item) => {
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
              time: item.latestMessage?.createdAt || item.update_time || item.updateTime,
              unreadCount: item.unreadCount || 0,
              sender: item.sender,
              withUser: item.with_user,
            };
          });
          transformed.sort((a, b) => parseInt(b.time) - parseInt(a.time));
          setMessages(transformed);
        }

        // 2. Gọi API để sync mới nhất
        console.log("🌐 Fetching from API...");
        const conversations = await GetAllMessage();

        if (conversations?.length > 0) {
          await saveConversations(conversations);
          
          // Transform và cập nhật UI
          const transformedMessages = conversations.map((item) => {
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
              time: item.latestMessage?.createdAt || item.updateTime || item.update_time,
              unreadCount: item.unreadCount || 0,
              sender: item.sender,
              withUser: item.with_user,
            };
          });

          transformedMessages.sort(
            (a, b) => parseInt(b.time) - parseInt(a.time)
          );

          setMessages(transformedMessages);
        }
      } catch (err) {
        console.error("❌ Fetch messages error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [resolveUserInfo]);

  // ======= SUBSCRIBE REALTIME DANH SÁCH CUỘC TRÒ CHUYỆN =======
  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("idToken");
    if (!token) return;

    // Handler để transform raw conversations thành UI format
    const transformConversations = (rawConversations) => {
      return rawConversations.map((item) => {
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
          lastMessage: item.latestMessage?.body || item.body || "",
          time: item.latestMessage?.createdAt || item.updateTime || item.update_time || item.createdAt,
          unreadCount: item.unreadCount || 0,
          sender: item.sender,
          withUser: item.with_user,
        };
      }).sort((a, b) => parseInt(b.time) - parseInt(a.time));
    };

    // Custom handler: merge raw conversations, save to cache, then transform và update UI
    const customHandler = async (data) => {
      if (!Array.isArray(data) || !data.length) return;

      // Upsert vào cache (lưu raw conversations)
      await upsertConversations(data);
      
      // Fetch tất cả từ cache và transform
      const allConversations = await getAllConversations();
      const transformed = transformConversations(allConversations);
      setMessages(transformed);
    };

    const off = onNewListMessages(customHandler);

    // Gửi yêu cầu bắt đầu stream danh sách
    emitGetListMessages({ timestamp: null, token });

    // Re-emit khi socket reconnect
    const socket = getSocket();
    const onReconnect = () => emitGetListMessages({ timestamp: null, token });
    socket.on("connect", onReconnect);

    return () => {
      off?.();
      socket.off("connect", onReconnect);
    };
  }, [resolveUserInfo]);

  // ======= GỌI CHI TIẾT CUỘC TRÒ CHUYỆN =======
  useEffect(() => {
    const fetchChatDetail = async () => {
      if (!selectedChat) return;
      try {
        setLoadingChat(true);
        setAvatarError(false); // Reset lỗi ảnh khi chọn chat mới
        
        // 1. Lấy từ cache trước
        const cached = await getMessagesByConversationId(selectedChat.uid);
        if (cached?.messages?.length > 0) {
          console.log("✅ Loaded messages from cache:", cached.messages.length);
          setChatMessages(cached.messages);
        }

        // 2. Gọi API để sync mới nhất
        const messages = await getMessagesWithUser(selectedChat.uid, null);
        
        if (messages?.length > 0) {
          // Lưu vào cache
          await saveMessageWithUsers(
            selectedChat.uid,
            selectedChat.withUser,
            messages
          );
          setChatMessages(messages.reverse());
        } else if (!cached?.messages?.length) {
          setChatMessages([]);
        }
      } catch (err) {
        console.error("❌ Fetch chat detail error:", err);
      } finally {
        setLoadingChat(false);
      }
    };

    fetchChatDetail();
  }, [selectedChat]);
  // ======= ĐÁNH DẤU ĐÃ ĐỌC =======
  useEffect(() => {
    if (!selectedChat) return;
    const markAsRead = async () => {
      try {
        await markReadMessage(selectedChat.uid);
      } catch (err) {
        console.error("Lỗi markAsRead:", err);
      }
    };

    markAsRead();
  }, [selectedChat]);


  // ======= SUBSCRIBE REALTIME CHI TIẾT CUỘC TRÒ CHUYỆN =======
  useEffect(() => {
    if (!selectedChat) return;
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("idToken");
    if (!token) return;

    // Handler để cập nhật messages và cache
    const handler = handleNewMessageWithUser((updatedMessages) => {
      setChatMessages(updatedMessages);
      // Lưu vào cache - hàm saveMessageWithUsers sẽ tự động sanitize dữ liệu
      if (Array.isArray(updatedMessages)) {
        saveMessageWithUsers(
          selectedChat.uid,
          selectedChat.withUser,
          updatedMessages
        );
      }
    });
    const off = onNewMessagesWithUser(handler);

    // Bắt đầu stream cho cuộc hội thoại được chọn
    emitGetMessagesWithUser({
      messageId: selectedChat.uid,
      timestamp: null,
      token,
    });

    // Re-emit khi socket reconnect
    const socket = getSocket();
    const onReconnect = () =>
      emitGetMessagesWithUser({ messageId: selectedChat.uid, timestamp: null, token });
    socket.on("connect", onReconnect);

    return () => {
      off?.();
      socket.off("connect", onReconnect);
    };
  }, [selectedChat]);
  //gửi tn
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    try {
      const messageData = {
        receiver_uid: selectedChat.withUser,
        message: newMessage.trim(),
        moment_id: null,
      };

      const result = await sendMessageService(messageData);

      if (result?.result?.status === 200 || result?.data) {
        // ✅ Cập nhật hiển thị ngay trên UI
        const newMsgObj = {
          id: result.data?.id || Date.now(),
          text: newMessage.trim(),
          sender: user?.uid,
          createdAt: Date.now() / 1000, // Unix timestamp
          create_time: Date.now() / 1000,
        };

        setChatMessages((prev) => [...prev, newMsgObj]);
        
        // Lưu vào cache
        await saveMessageWithUsers(
          selectedChat.uid,
          selectedChat.withUser,
          [...chatMessages, newMsgObj]
        );
        
        setNewMessage("");
      } else {
        throw new Error("Send message failed");
      }
    } catch (err) {
      console.error("Send message error:", err);
      alert("Không thể gửi tin nhắn");
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const now = Date.now();
      const diff = now - lastEnterTime;

      if (diff < 400) {
        // Ấn Enter hai lần nhanh → gửi
        e.preventDefault();
        handleSendMessage();
      } else {
        // Ấn Enter một lần → thêm xuống dòng (\n)
        e.preventDefault();
        setNewMessage((prev) => prev + "\n");
        setLastEnterTime(now);
      }
    }
  };

  const handleReactMessage = async (messageId, emoji) => {
    try {
      if (!selectedChat?.uid) {
        console.error("Không có conversation_id hợp lệ");
        return;
      }

      const result = await sendReactionOnMessage({
        messageId,
        emoji,
        conversationId: selectedChat.uid,
      });

      // ✅ cập nhật local ngay nếu API trả về reactions mới
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                reactions: result?.data?.reactions || m.reactions || [],
              }
            : m
        )
      );
      
      // Cập nhật cache
      const updatedMessages = chatMessages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              reactions: result?.data?.reactions || m.reactions || [],
            }
          : m
      );
      await saveMessageWithUsers(
        selectedChat.uid,
        selectedChat.withUser,
        updatedMessages
      );
    } catch (err) {
      console.error("Lỗi khi gửi reaction:", err);
    }
  };
  useEffect(() => {
    const handleClickOutside = () => setActiveReactionMsg(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);




  // ======= GIAO DIỆN =======
  return (
    <div className="relative min-h-screen overflow-hidden bg-base-100 text-base-content transition-colors duration-300">
      {/* DANH SÁCH TIN NHẮN */}
      <div
        className={`absolute inset-0 transition-transform duration-500 flex flex-col ${
          selectedChat ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between gap-4 p-4 border-b border-base-300 bg-base-200/50 backdrop-blur">
          <Link 
            to="/locket" 
            className="hover:bg-base-300 rounded-lg p-2 transition-colors flex items-center"
          >
            <ArrowLeft size={24} />
            <span className="ml-2">Tin nhắn</span>
          </Link>
          <SocketStatus isConnected={isConnected} />
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
                {/* Chỉ hiển thị avatar và tên khi có dữ liệu hợp lệ (có conversation) */}
                {selectedChat?.withUser && (selectedChat?.name || selectedChat?.avatarImage || selectedChat?.avatarText) ? (
                  <>
                    {selectedChat.avatarImage && !avatarError ? (
                      <img
                        src={selectedChat.avatarImage}
                        alt={selectedChat.name || "User"}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center text-base-content text-sm font-semibold">
                        {selectedChat.avatarText || selectedChat.name?.substring(0, 2).toUpperCase() || "U"}
                      </div>
                    )}
                    <h1 className="text-xl font-semibold">
                      {selectedChat.name || "Người dùng"}
                    </h1>
                  </>
                ) : (
                  <h1 className="text-xl font-semibold text-base-content/60">
                    Chưa có cuộc trò chuyện
                  </h1>
                )}
              </div>
            </div>

            <div className="flex flex-col h-[calc(100vh-64px)]">
              <div ref={messagesEndRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingChat ? (
                  <div className="text-center text-gray-500">Đang tải tin nhắn...</div>
                ) : (
                  chatMessages.map((msg) => {
                    const isOwn = msg.sender === user?.uid;

                    const textWithBreaks = msg.text
                      ?.split("\n")
                      .map((line, i) => (
                        <span key={i}>
                          {line}
                          <br />
                        </span>
                      ));

                    const rawTimestamp =
                      msg.create_time ??
                      msg.createdAt ??
                      msg.created_at ??
                      msg.timestamp ??
                      msg.time;

                    let formattedTime = "";
                    if (rawTimestamp) {
                      const numericTimestamp = Number(rawTimestamp);
                      const toMillis =
                        Number.isFinite(numericTimestamp) && numericTimestamp < 1e12
                          ? numericTimestamp * 1000
                          : numericTimestamp;
                      if (!Number.isNaN(toMillis)) {
                        formattedTime = new Date(toMillis).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      }
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                        onMouseDown={() => {
                          pressTimerRef.current = setTimeout(() => {
                            setActiveReactionMsg(msg.id);
                          }, 2000); // ⏱ Giữ chuột 1 giây mới hiện popup emoji
                        }}
                        onMouseUp={() => clearTimeout(pressTimerRef.current)}
                        onMouseLeave={() => clearTimeout(pressTimerRef.current)}
                        onTouchStart={() => {
                          pressTimerRef.current = setTimeout(() => {
                            setActiveReactionMsg(msg.id);
                          }, 2000); // ⏱ Giữ tay trên màn hình 1 giây
                        }}
                        onTouchEnd={() => clearTimeout(pressTimerRef.current)}
                      >
                        {/* Nội dung tin nhắn */}
                        <div
                          className={`px-3 py-2 rounded-2xl text-sm md:text-base shadow-sm max-w-[75%] whitespace-pre-wrap break-words relative group ${
                            isOwn
                              ? "bg-primary text-primary-content rounded-br-none"
                              : "bg-base-300 rounded-bl-none"
                          }`}
                        >
                          {/* Reply moment */}
                          {msg.reply_moment && (
                            <div className="mb-1 text-xs italic opacity-70">
                              ↪ {msg.reply_moment}
                            </div>
                          )}

                          {/* Thumbnail / media */}
                          {msg.thumbnail_url && (
                            <img
                              src={msg.thumbnail_url}
                              alt="thumbnail"
                              className="w-40 h-40 object-cover rounded-lg my-1 border border-base-200"
                            />
                          )}

                          {/* Text */}
                          {textWithBreaks && textWithBreaks.length > 0 ? (
                            <div>{textWithBreaks}</div>
                          ) : msg.text ? (
                            <div>{msg.text}</div>
                          ) : null}

                          {/* Hiển thị reactions đã có */}
                          {msg.reactions?.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {msg.reactions.map((r, i) => (
                                <span
                                  key={i}
                                  className="text-sm bg-base-100/70 px-1.5 py-0.5 rounded-full shadow-sm border border-base-300 cursor-default"
                                  title={r.sender}
                                >
                                  {r.emoji}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Nếu tin nhắn này đang được ấn giữ -> hiện popup emoji */}
                          {activeReactionMsg === msg.id && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-base-200 shadow-lg rounded-full px-3 py-1 flex gap-2 z-50">
                              {["👍", "❤️", "😂", "😮", "😢", "🔥", "😍"].map((emo) => (
                                <button
                                  key={emo}
                                  onClick={() => {
                                    handleReactMessage(msg.id, emo);
                                    setActiveReactionMsg(null); // ẩn sau khi chọn
                                  }}
                                  className="text-xl hover:scale-125 transition-transform"
                                >
                                  {emo}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Thời gian gửi */}
                        {formattedTime && (
                          <span className="mt-1 text-xs text-base-content/60">
                            {formattedTime}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-base-300 p-3 flex bg-base-200/30">
                <textarea
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  className="flex-1 bg-base-100 rounded-lg px-3 py-2 outline-none border border-base-300 resize-none overflow-hidden"
                  style={{ minHeight: "40px", maxHeight: "120px" }}
                />
                <button
                  onClick={handleSendMessage}
                  className="ml-3 bg-primary text-primary-content px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                >
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