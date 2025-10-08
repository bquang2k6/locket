import React, { useState, useEffect, useContext, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { AuthContext } from "../../context/AuthLocket";
import { createResolveUserInfo } from "../UILocket/ExtendPage/components/resolveUserInfo";
import Listmsg from "./components/Listmsg";
import {
  onNewListMessages,
  onNewMessagesWithUser,
  emitGetListMessages,
  emitGetMessagesWithUser,
  getSocket,
} from "../../lib/socket";


export default function ChatListPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatMessages, setChatMessages] = useState([]); // <== thêm state này
  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState(null);
  const { friendDetails, user } = useContext(AuthContext);
  const [newMessage, setNewMessage] = useState("");
  const [lastEnterTime, setLastEnterTime] = useState(0);
  const [activeReactionMsg, setActiveReactionMsg] = useState(null);

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

  // ======= SUBSCRIBE REALTIME DANH SÁCH CUỘC TRÒ CHUYỆN =======
  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("idToken");
    if (!token) return;

    // Bắt đầu lắng nghe realtime danh sách hội thoại
    const off = onNewListMessages((batch = []) => {
      if (!Array.isArray(batch) || batch.length === 0) return;

      // Map sang cấu trúc UI hiện tại
      const mapped = batch.map((item) => {
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
          time: item.latestMessage?.createdAt || item.updateTime || item.createdAt,
          unreadCount: item.unreadCount || 0,
          sender: item.sender,
          withUser: item.with_user,
        };
      });

      setMessages((prev) => {
        const byId = new Map(prev.map((c) => [c.uid, c]));
        for (const conv of mapped) {
          const existing = byId.get(conv.uid);
          if (!existing) {
            byId.set(conv.uid, conv);
          } else {
            byId.set(conv.uid, {
              ...existing,
              ...conv,
            });
          }
        }
        const merged = Array.from(byId.values());
        merged.sort((a, b) => parseInt(b.time) - parseInt(a.time));
        return merged;
      });
    });

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
  // ======= ĐÁNH DẤU ĐÃ ĐỌC =======
  useEffect(() => {
    if (!selectedChat) return;
    const markAsRead = async () => {
      try {
        const token =
          localStorage.getItem("authToken") || localStorage.getItem("idToken");
        if (!token) return;

        await fetch("https://api.wangtech.top/locket/markAsRead", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // thêm nếu API yêu cầu token
          },
          body: JSON.stringify({
            data: {
              conversation_uid: selectedChat.uid,
            },
          }),
        });
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

    // Lắng nghe tin nhắn mới trong cuộc trò chuyện hiện tại
    const off = onNewMessagesWithUser((batch = []) => {
      if (!Array.isArray(batch) || batch.length === 0) return;

      setChatMessages((prev) => {
        const map = new Map((prev || []).map((m) => [m.id, m]));
        for (const m of batch) {
          map.set(m.id, m);
        }
        const merged = Array.from(map.values());
        merged.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        return merged;
      });
    });

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
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("idToken");
      if (!token) {
        alert("Vui lòng đăng nhập lại");
        return;
      }

      const payload = {
        data: {
          msg: newMessage.trim(),
          moment_uid: null,
          receiver_uid: selectedChat.withUser, // uid người nhận
        },
      };

      const res = await fetch("https://api.wangtech.top/locket/sendChatMessageV2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gửi tin nhắn thất bại");
      const result = await res.json();

      // ✅ Cập nhật hiển thị ngay trên UI
      const newMsgObj = {
        id: result.data?.id || Date.now(),
        text: newMessage.trim(),
        sender: user?.uid,
        createdAt: Date.now(),
      };

      setChatMessages((prev) => [...prev, newMsgObj]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
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
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("idToken");
      if (!token) {
        alert("Vui lòng đăng nhập lại");
        return;
      }

      if (!selectedChat?.uid) {
        console.error("Không có conversation_id hợp lệ");
        return;
      }

      const payload = {
        data: {
          message_id: messageId,
          emoji: emoji,
          conversation_id: selectedChat.uid,
        },
      };

      const res = await fetch("http://localhost:5001/locket/sendChatMessageReaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gửi reaction thất bại");
      const result = await res.json();

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

            <div className="flex flex-col h-[calc(100vh-64px)]">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
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

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                        onMouseDown={() => {
                          // bắt đầu đếm thời gian nhấn giữ
                          this.pressTimer = setTimeout(() => {
                            setActiveReactionMsg(msg.id); // hiển thị popup emoji
                          }, 500);
                        }}
                        onMouseUp={() => clearTimeout(this.pressTimer)} // thả chuột -> hủy
                        onMouseLeave={() => clearTimeout(this.pressTimer)} // rời khỏi vùng -> hủy
                        onTouchStart={() => {
                          this.pressTimer = setTimeout(() => {
                            setActiveReactionMsg(msg.id);
                          }, 500);
                        }}
                        onTouchEnd={() => clearTimeout(this.pressTimer)}
                      >
                        {/* Nội dung tin nhắn */}
                        <div
                          className={`px-3 py-2 rounded-2xl text-sm md:text-base shadow-sm max-w-[75%] whitespace-pre-wrap break-words relative group ${
                            isOwn
                              ? "bg-primary text-primary-content rounded-br-none"
                              : "bg-base-300 rounded-bl-none"
                          }`}
                        >
                          {textWithBreaks}

                          {/* Hiển thị reactions đã có */}
                          {msg.reactions?.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {msg.reactions.map((r, i) => (
                                <span
                                  key={i}
                                  className="text-sm bg-base-100/60 px-1.5 py-0.5 rounded-full shadow-sm border border-base-300 cursor-default"
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
