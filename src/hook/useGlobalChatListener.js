import { useEffect, useState, useContext, useRef } from "react";
import Favico from "favico.js";
import {
  onNewListMessages,
  emitGetListMessages,
  getSocket,
} from "../lib/socket";
import { AuthContext } from "../context/AuthLocket";

export default function useGlobalChatListener() {
  const { user } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const faviconRef = useRef(null);
  const channelRef = useRef(null);

  // 🎨 Khởi tạo Favico + kênh giao tiếp
  useEffect(() => {
    faviconRef.current = new Favico({
      animation: "slide",
      bgColor: "#FF4444",
      textColor: "#FFFFFF",
      fontStyle: "bold",
      position: "down", // ← Badge ở dưới cùng
      type: "circle",
    });

    channelRef.current = new BroadcastChannel("chat_notification_channel");

    // 🟢 Khi nhận tín hiệu từ tab khác
    channelRef.current.onmessage = (event) => {
      const { type, count } = event.data || {};
      if (type === "UPDATE_UNREAD") {
        setUnreadCount(count || 0);
        localStorage.setItem("global_unread_count", count || 0);
      }
    };

    // 🟢 Khi load lại trang → khôi phục từ localStorage
    const savedCount = parseInt(localStorage.getItem("global_unread_count") || "0", 10);
    if (savedCount > 0) {
      setUnreadCount(savedCount);
    }

    return () => channelRef.current?.close();
  }, []);

  // 🧠 Lắng nghe socket
  useEffect(() => {
    if (!user) return;

    const token =
      localStorage.getItem("authToken") || localStorage.getItem("idToken");
    if (!token) return;

    const off = onNewListMessages((batch = []) => {
      if (!Array.isArray(batch) || batch.length === 0) return;

      const totalUnread = batch.reduce(
        (sum, item) => sum + (item.unreadCount || 0),
        0
      );

      setUnreadCount(totalUnread);
      localStorage.setItem("global_unread_count", totalUnread);

      // 🔄 Gửi cho các tab khác
      channelRef.current?.postMessage({
        type: "UPDATE_UNREAD",
        count: totalUnread,
      });
    });

    emitGetListMessages({ timestamp: null, token });

    const socket = getSocket();
    const onReconnect = () => emitGetListMessages({ timestamp: null, token });
    socket.on("connect", onReconnect);

    const onVisible = () => {
      if (!document.hidden) emitGetListMessages({ timestamp: null, token });
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      off?.();
      socket.off("connect", onReconnect);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user]);

  // 🔔 Cập nhật favicon + title
  useEffect(() => {
    if (!faviconRef.current) return;

    if (unreadCount > 0) {
      faviconRef.current.badge(unreadCount > 99 ? "99+" : unreadCount);
      document.title = `(${unreadCount}) Tin nhắn mới`;
    } else {
      faviconRef.current.reset();
      document.title = "Chat";
    }
  }, [unreadCount]);
}
