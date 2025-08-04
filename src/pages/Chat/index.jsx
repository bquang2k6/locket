import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { API_URL } from "../../utils/API/apiRoutes";
import { AuthContext } from "../../context/AuthLocket";

// Hàm lấy tên hiển thị từ user object (chỉ lấy ở ngoài cùng)
function getDisplayName(user) {
  return (
    user?.displayName ||
    user?.display_name ||
    user?.username ||
    user?.uid ||
    "Ẩn danh"
  );
}

function canRecall(msg, user) {
  if (isAdmin(user)) return !msg.recalled;
  if (msg.sender_id !== user.uid) return false;
  if (msg.recalled) return false;
  const sentTime = new Date(msg.timestamp);
  const now = new Date();
  return (now - sentTime) / 1000 <= 300; // 5 phút
}

// Cho phép admin chỉnh sửa bất kỳ tin nhắn nào
function canEdit(msg, user) {
  if (isAdmin(user)) return !msg.recalled;
  return canRecall(msg, user);
}

function isAdmin(user) {
  // Tùy hệ thống, ví dụ user.role === 'admin' hoặc user.isAdmin
  return user?.role === 'admin' || user?.isAdmin;
}

export default function ChatPage() {
  const { user } = useContext(AuthContext);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatPolling, setChatPolling] = useState(null);
  const [userCache, setUserCache] = useState({});
  const [recalling, setRecalling] = useState("");
  const [editingMsg, setEditingMsg] = useState(null);
  const [editText, setEditText] = useState("");
  const [menuMsgId, setMenuMsgId] = useState(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const fetchMessages = () => {
      axios.get(API_URL.CHAT_GET_MESSAGES)
        .then(async res => {
          const messages = res.data.messages || [];
          const uids = Array.from(new Set(messages.map(m => m.sender_id)));
          const missingUids = uids.filter(uid => !userCache[uid]);
          let newUserCache = { ...userCache };
          if (missingUids.length > 0) {
            const idToken = localStorage.getItem("idToken");
            await Promise.all(missingUids.map(async uid => {
              try {
                const res = await axios.post(
                  API_URL.GET_USER,
                  { data: { user_uid: uid } },
                  { headers: { Authorization: `Bearer ${idToken}` } }
                );
                const info = res.data?.result?.data || {};
                newUserCache[uid] = getDisplayName(info);
              } catch {
                newUserCache[uid] = uid;
              }
            }));
            setUserCache(newUserCache);
          }
          setChatMessages(messages);
        })
        .catch(() => setChatMessages([]));
    };
    fetchMessages();
    const poll = setInterval(fetchMessages, 2000);
    setChatPolling(poll);
    return () => clearInterval(poll);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Chỉ auto-scroll nếu người dùng đang ở gần cuối
    const container = messagesContainerRef.current;
    if (!container || !messagesEndRef.current) return;
    const threshold = 40; // px, khoảng cách từ đáy để coi là "gần cuối" (giảm từ 120 xuống 40)
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    if (isNearBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Đóng menu khi click ngoài
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuMsgId(null);
      }
    }
    if (menuMsgId) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuMsgId]);

  const handleRecall = async (msg) => {
    setRecalling(msg._id);
    try {
      await axios.post(API_URL.CHAT_RECALL_MESSAGE, {
        message_id: msg._id,
        user_id: user.uid,
        is_admin: isAdmin(user),
      });
    } catch (err) {
      alert("Không thể thu hồi: " + (err.response?.data?.detail || err.message));
    }
    setRecalling("");
    setMenuMsgId(null);
  };

  const handleEdit = (msg) => {
    setEditingMsg(msg);
    setEditText(msg.text);
    setMenuMsgId(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingMsg) return;
    try {
      await axios.post(API_URL.CHAT_EDIT_MESSAGE, {
        message_id: editingMsg._id,
        user_id: user.uid,
        new_text: editText,
        is_admin: isAdmin(user),
      });
      setEditingMsg(null);
      setEditText("");
    } catch (err) {
      alert("Không thể chỉnh sửa: " + (err.response?.data?.detail || err.message));
    }
  };

  const handlePin = async (msg, pin) => {
    try {
      await axios.post(API_URL.CHAT_PIN_MESSAGE, {
        message_id: msg._id,
        is_admin: true,
        pin,
      });
    } catch (err) {
      alert("Không thể ghim: " + (err.response?.data?.detail || err.message));
    }
    setMenuMsgId(null);
  };

  // Long press logic
  let pressTimer = null;
  const handlePressStart = (e, msg) => {
    e.preventDefault();
    pressTimer = setTimeout(() => {
      setMenuMsgId(msg._id);
    }, 500);
  };
  const handlePressEnd = () => {
    clearTimeout(pressTimer);
  };

  // Tách tin nhắn ghim và không ghim
  const pinnedMessages = chatMessages.filter(m => m.pinned && !m.recalled);
  const normalMessages = chatMessages.filter(m => !m.pinned || m.recalled);

  return (
    <div className="flex flex-col h-screen bg-base-100 text-base-content">
      <div className="flex items-center border-b p-4 h-16 min-h-16 fixed top-0 left-0 right-0 z-40 bg-base-100">
        <span className="font-bold text-xl">Phòng chat chung</span>
      </div>
      {/* Thanh pinned bar luôn cố định trên cùng màn hình */}
      {pinnedMessages.length > 0 && (
        <div className="z-30 bg-base-100 border-b border-yellow-300 shadow-sm fixed left-0 right-0" style={{top: 64}}>
          <div className="flex items-center gap-1 px-2 py-1 min-h-6 overflow-x-auto scrollbar-thin scrollbar-thumb-yellow-200">
            <span className="text-yellow-500 text-base flex-shrink-0">📌</span>
            <span className="font-bold text-yellow-700 text-sm flex-shrink-0">Tin nhắn đã ghim</span>
            <div className="flex gap-2 ml-2">
              {pinnedMessages.map((msg, idx) => (
                <div
                  key={msg._id || idx}
                  className={
                    "px-2 py-1 rounded-lg max-w-xs break-words border border-yellow-300 bg-yellow-50 text-base-content text-sm relative flex-shrink-0 mr-1"
                  }
                  style={{ minWidth: 120 }}
                >
                  {msg.recalled ? (
                    <span className="italic text-gray-400 text-xs">
                      {msg.recalled_by === 'admin'
                        ? 'Admin đã thu hồi tin nhắn'
                        : 'Tin nhắn đã được thu hồi'}
                    </span>
                  ) : (
                    <>
                      <span className="font-semibold text-xs">{msg.sender_id === user.uid ? "Bạn" : (msg.sender_display_name || userCache[msg.sender_id] || msg.sender_id)}: </span>
                      {msg.text}
                      {msg.edited && (
                        <span className="ml-1 text-xs italic">
                          {msg.edit_by === 'admin' ? '(admin đã chỉnh sửa)' : '(đã chỉnh sửa)'}
                        </span>
                      )}
                      <span className="ml-1 text-xs text-yellow-500">📌</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden" style={{paddingTop: pinnedMessages.length > 0 ? 104 : 64}}>
        {/* Khung cuộn tin nhắn thường */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 pt-0 md:pt-0">
          {normalMessages.length === 0 ? (
            <div className="text-gray-400 text-center mt-10">Chưa có tin nhắn nào. chức năng này tạm đóng</div>
            
            
          ) : (
            normalMessages.map((msg, idx) => (
              <div
                key={msg._id || idx}
                className={`flex ${msg.sender_id === user.uid ? "justify-end" : "justify-start"} mb-2`}
                onMouseDown={e => handlePressStart(e, msg)}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={e => handlePressStart(e, msg)}
                onTouchEnd={handlePressEnd}
              >
                <div className={
                  `px-3 py-2 rounded-lg max-w-xs break-words relative ` +
                  (msg.sender_id === user.uid
                    ? "bg-primary text-primary-content"
                    : "bg-base-200 text-base-content") +
                  (msg.pinned ? " border-2 border-yellow-400" : "")
                }>
                  {msg.recalled ? (
                    <span className="italic text-gray-400">
                      {msg.recalled_by === 'admin'
                        ? 'Admin đã thu hồi tin nhắn'
                        : 'Tin nhắn đã được thu hồi'}
                    </span>
                  ) : editingMsg && editingMsg._id === msg._id ? (
                    <form onSubmit={handleEditSubmit} className="flex flex-col gap-2">
                      <input
                        className="border rounded px-2 py-1 text-base-content"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="px-2 py-1 bg-primary text-primary-content rounded text-xs">Lưu</button>
                        <button type="button" className="px-2 py-1 bg-base-200 text-xs rounded" onClick={() => setEditingMsg(null)}>Hủy</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <span className="font-semibold">{msg.sender_id === user.uid ? "Bạn" : (msg.sender_display_name || userCache[msg.sender_id] || msg.sender_id)}: </span>
                      {msg.text}
                      {msg.edited && (
                        <span className="ml-1 text-xs italic">
                          {msg.edit_by === 'admin' ? '(admin đã chỉnh sửa)' : '(đã chỉnh sửa)'}
                        </span>
                      )}
                      {msg.pinned && <span className="ml-1 text-xs text-yellow-500">📌</span>}
                    </>
                  )}
                  {/* Menu long press */}
                  {menuMsgId === msg._id && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl text-base-content animate-fade-in min-w-[160px]"
                      style={{ minWidth: 150 }}
                    >
                      {canEdit(msg, user) && !msg.recalled && (
                        <button
                          className="flex items-center w-full px-4 py-2 gap-2 hover:bg-blue-100 transition-colors rounded-t-xl"
                          onClick={() => handleEdit(msg)}
                        >
                          <span role="img" aria-label="edit">✏️</span>
                          <span>Chỉnh sửa</span>
                        </button>
                      )}
                      {canRecall(msg, user) && !msg.recalled && (
                        <button
                          className="flex items-center w-full px-4 py-2 gap-2 hover:bg-red-100 text-red-600 font-semibold transition-colors"
                          onClick={() => handleRecall(msg)}
                          disabled={recalling === msg._id}
                        >
                          <span role="img" aria-label="recall">🗑️</span>
                          <span>{recalling === msg._id ? "Đang thu hồi..." : "Thu hồi"}</span>
                        </button>
                      )}
                      {isAdmin(user) && (
                        <button
                          className="flex items-center w-full px-4 py-2 gap-2 hover:bg-yellow-100 text-yellow-700 transition-colors rounded-b-xl"
                          onClick={() => handlePin(msg, !msg.pinned)}
                        >
                          <span role="img" aria-label="pin">📌</span>
                          <span>{msg.pinned ? "Bỏ ghim" : "Ghim đoạn chat"}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form
        onSubmit={async e => {
          e.preventDefault();
          if (chatInput.trim() === "") return;
          await axios.post(API_URL.CHAT_SEND_MESSAGE, {
            sender_id: user.uid,
            sender_display_name: user.displayName || user.display_name || user.username || user.uid,
            receiver_id: "all",
            text: chatInput,
            timestamp: new Date().toISOString(),
          });
          setChatInput("");
        }}
        className="p-4 border-t flex bg-base-100"
      >
        <input
          className="flex-1 border rounded px-2 py-2 bg-base-200 text-base-content"
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
        />
        <button type="submit" className="ml-2 px-4 py-2 bg-primary text-primary-content rounded">Gửi</button>
      </form>
    </div>
  );
} 