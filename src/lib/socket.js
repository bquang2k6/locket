import { io } from "socket.io-client";

let socketInstance = null;

function getBaseWsUrl() {
  const envWs = import.meta?.env?.VITE_BASE_API_URL_WS;

  if (envWs) return envWs;

  // Auto chọn protocol tương ứng (dev/prod)
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.hostname;
  const port = window.location.port || "8000";

  return `${protocol}//${host}:${port}`;
}


export function getSocket() {
  if (socketInstance && socketInstance.connected) return socketInstance;

  if (!socketInstance) {
    socketInstance = io(`${getBaseWsUrl()}/chat`, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 3000,
    });
  } else if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
}


export function onNewListMessages(callback) {
  const socket = getSocket();
  socket.on("new_on_list_message", callback);
  return () => socket.off("new_on_list_message", callback);
}

export function onNewMessagesWithUser(callback) {
  const socket = getSocket();
  socket.on("new_message_with_user", callback);
  return () => socket.off("new_message_with_user", callback);
}

export function emitGetListMessages({ timestamp = null, token }) {
  const socket = getSocket();
  socket.emit("get_list_message", { timestamp, token });
}

export function emitGetMessagesWithUser({ messageId, timestamp = null, token }) {
  const socket = getSocket();
  socket.emit("get_messages_with_user", { messageId, timestamp, token });
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
  }
}


