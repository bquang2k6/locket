// socketHandlers.js (tách riêng cho gọn, có thể để trong thư mục /utils hoặc /socket)
export const handleListMessage =
  (setMessages, upsertConversations) => async (data) => {
    if (!Array.isArray(data) || !data.length) return;

    setMessages((prev) => {
      const merged = [...prev];
      data.forEach((newConv) => {
        const index = merged.findIndex((c) => c.uid === newConv.uid);
        if (index > -1) merged[index] = { ...merged[index], ...newConv };
        else merged.unshift(newConv);
      });
      return merged;
    });

    await upsertConversations(data);
  };

export const handleNewMessage =
  (setMessages, setChatMessages, selectedChat) => (msg) => {
    console.log("📩 [Global] Received new message:", msg);

    // cập nhật conversation list
    setMessages((prev) => {
      const index = prev.findIndex((c) => c.uid === msg.with_user);
      if (index > -1) {
        prev[index] = {
          ...prev[index],
          latestMessage: msg,
          messages: [...(prev[index].messages || []), msg],
        };
      } else {
        prev.unshift({
          uid: msg.with_user,
          latestMessage: msg,
          messages: [msg],
        });
      }
      return [...prev];
    });

    // nếu đang mở chat đó thì push luôn
    if (selectedChat?.uid === msg.with_user) {
      setChatMessages((prev) => [...prev, msg]);
    }
  };

export const handleListMessageWithUser = (setChatMessages) => (data) => {
  console.log("📥 [User] List messages with user:", data);
  if (Array.isArray(data)) {
    setChatMessages(data || []);
  } else {
    setChatMessages([]);
  }
};

export const handleNewMessageWithUser = (setChatMessages) => (msg) => {
  setChatMessages((prev) => {
    const merged = [...prev];
    const messagesToAdd = Array.isArray(msg) ? msg : [msg];
    
    messagesToAdd.forEach((newMsg) => {
      const index = merged.findIndex((c) => c.id === newMsg.id);
      if (index > -1) merged[index] = { ...merged[index], ...newMsg };
      else merged.push(newMsg);
    });
    
    // Sort by create_time or createdAt
    merged.sort((a, b) => {
      const timeA = Number(a.create_time || a.createdAt || 0);
      const timeB = Number(b.create_time || b.createdAt || 0);
      return timeA - timeB;
    });
    
    return merged;
  });
};

