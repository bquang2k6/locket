import { io } from "socket.io-client";

let socketInstance = null;

function getBaseWsUrl() {
  const wsUrl = import.meta?.env?.VITE_BASE_API_URL_WS;
  return wsUrl || "https://wslocketwan.wibu.life";
  // return wsUrl || "http://localhost:8000";
}

export function getSocket() {
  if (socketInstance && socketInstance.connected) return socketInstance;

  if (!socketInstance) {
    const url = getBaseWsUrl();
    console.error("DEBUG [Client]: Connecting to socket:", url, "at", new Date().toLocaleTimeString());

    socketInstance = io(url, {
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

export function onConnect(callback) {
  const socket = getSocket();
  socket.on("connect", callback);
  return () => socket.off("connect", callback);
}

export function onNewMessagesWithUser(callback) {
  const socket = getSocket();
  socket.on("new_message_with_user", callback);
  return () => socket.off("new_message_with_user", callback);
}

export function onNewMoments(callback) {
  const socket = getSocket();
  socket.on("new_on_moments", callback);
  return () => socket.off("new_on_moments", callback);
}

export function onMomentDeleted(callback) {
  const socket = getSocket();
  socket.on("moment_deleted", callback);
  return () => socket.off("moment_deleted", callback);
}

export function emitGetListMessages({ timestamp = null, token }) {
  const socket = getSocket();
  socket.emit("get_list_message", { timestamp, token });
}

export function emitGetMessagesWithUser({ messageId, timestamp = null, token }) {
  const socket = getSocket();
  socket.emit("get_messages_with_user", { messageId, timestamp, token });
}

export function emitGetMoments({ friendId = null, timestamp = null, token, limit = 50 }) {
  const socket = getSocket();
  socket.emit("get_moments", { friendId, timestamp, token, limit });
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
  }
}


