import { API_URL } from "../../utils/API/apiRoutes";
import axios from "axios";
import { getCurrentUserTokenAndUid } from "../../utils/auth";

export const GetAllMessage = async (timestamp = null) => {
  try {
    const token = localStorage.getItem("authToken") || localStorage.getItem("idToken");
    if (!token) throw new Error("No token found");

    const res = await axios.post(
      String(API_URL.GET_All_MESSAGE),
      { timestamp },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data?.data;
  } catch (err) {
    console.warn("Failed to get all messages", err);
    return null;
  }
};

export const getMessagesWithUser = async (
  messageId, // uid của người cần lấy message
  timestamp = null
) => {
  try {
    const token = localStorage.getItem("authToken") || localStorage.getItem("idToken");
    if (!token) throw new Error("No token found");

    const res = await axios.post(
      String(API_URL.GET_All_MESSAGE_WITH_USER),
      {
        messageId: messageId,
        timestamp,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data?.data;
  } catch (err) {
    console.warn("Failed to get messages with user", err);
    return null;
  }
};

export const sendMessage = async (messageInfo) => {
  try {
    const token = localStorage.getItem("authToken") || localStorage.getItem("idToken");
    if (!token) throw new Error("No token found");

    const body = {
      data: {
        msg: messageInfo.message || " ", // Nội dung tin nhắn
        moment_uid: messageInfo?.moment_id || null,
        receiver_uid: messageInfo.receiver_uid,
      },
    };

    const response = await axios.post(String(API_URL.SEND_CHAT_MESSAGE), body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (err) {
    console.error("sendMessage error:", err);
    throw err;
  }
};

export const markReadMessage = async (conversationId) => {
  try {
    const token = localStorage.getItem("authToken") || localStorage.getItem("idToken");
    if (!token) throw new Error("No token found");

    const body = {
      data: {
        conversation_uid: conversationId,
      },
    };

    const response = await axios.post(String(API_URL.MARK_AS_READ), body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (err) {
    console.error("markReadMessage error:", err);
    throw err;
  }
};

export const sendReactionOnMessage = async (reactionData) => {
  try {
    const token = localStorage.getItem("authToken") || localStorage.getItem("idToken");
    if (!token) throw new Error("No token found");

    const body = {
      data: {
        message_id: reactionData.messageId,
        emoji: reactionData.emoji,
        conversation_id: reactionData.conversationId,
      },
    };

    const response = await axios.post(
      String(API_URL.SEND_CHAT_MESSAGE_REACTION),
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error("sendReactionOnMessage error:", err);
    throw err;
  }
};

export const deleteMessage = async (deleteData) => {
  try {
    const token = localStorage.getItem("authToken") || localStorage.getItem("idToken");
    if (!token) throw new Error("No token found");

    const body = {
      data: {
        message_uid: deleteData.message_uid,
        conversation_uid: deleteData.conversation_uid,
      },
    };

    const response = await axios.post("deleteChatMessage", body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (err) {
    console.error("deleteMessage error:", err);
    throw err;
  }
};

