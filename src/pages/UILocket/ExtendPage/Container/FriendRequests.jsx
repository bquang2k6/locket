import { memo, useState } from "react";
import axios from "axios";
import { ChevronDown } from "lucide-react";
import * as utils from "../../../../utils/index";
import { API_URL } from "../../../../utils/API/apiRoutes";

const FriendRequests = () => {
  const [expanded, setExpanded] = useState(false);

  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);

  const [loadingIncoming, setLoadingIncoming] = useState(false);
  const [loadingOutgoing, setLoadingOutgoing] = useState(false);

  /* ==========================
        1. Gọi API lấy UID
  =========================== */

  const fetchUIDList = async (url) => {
    try {
      const auth = await utils.getCurrentUserTokenAndUid();
      if (!auth) return [];

      const res = await axios.post(url, {
        idToken: auth.idToken,
        localId: auth.localId,
      });

      return res?.data?.data || [];
    } catch (err) {
      console.error("Lỗi fetch UID list:", err);
      return [];
    }
  };

  /* ==========================
        2. Lấy user info từ UID
  =========================== */
  /* ==========================
    2. Lấy user info từ UID
  =========================== */
  const fetchUserInfo = async (user_uid) => {
    try {
      const token = 
        localStorage.getItem("authToken") || 
        localStorage.getItem("idToken");

      if (!token) {
        console.error("Không tìm thấy token");
        return null;
      }

      const res = await axios.post(
        "https://api.locketcamera.com/fetchUserV2",
        {
          data: {
            user_uid,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res?.data?.result?.data || null;
    } catch (err) {
      console.error("Lỗi fetch user:", err);
      return null;
    }
  };

  /* ==========================
       3. Fetch tất cả khi mở box
  =========================== */

  const fetchAll = async () => {
    setLoadingIncoming(true);
    setLoadingOutgoing(true);

    // Try to load cached values first so UI is responsive
    try {
      const cachedIncoming = sessionStorage.getItem("incomingRequests");
      const cachedOutgoing = sessionStorage.getItem("outgoingRequests");
      if (cachedIncoming) setIncoming(JSON.parse(cachedIncoming));
      if (cachedOutgoing) setOutgoing(JSON.parse(cachedOutgoing));
    } catch (err) {
      console.warn("Failed to read friend requests cache:", err);
    }

    // B1: gọi danh sách UID incoming & outgoing
    const incomingList = await fetchUIDList(API_URL.INCOMING_FRIEND_REQUESTS);
    const outgoingList = await fetchUIDList(API_URL.OUTGOING_FRIEND_REQUESTS);

    // B2: lấy profile từng UID
    const incomingUsers = await Promise.all(
      incomingList.map(async (item) => {
        const user = await fetchUserInfo(item.uid);
        return { ...user, date: item.date, uid: item.uid };
      })
    );

    const outgoingUsers = await Promise.all(
      outgoingList.map(async (item) => {
        const user = await fetchUserInfo(item.uid);
        return { ...user, date: item.date, uid: item.uid };
      })
    );

    setIncoming(incomingUsers.filter(Boolean));
    const cleanedOutgoing = outgoingUsers.filter(Boolean);
    setOutgoing(cleanedOutgoing);

    // Save fresh results to sessionStorage (cache)
    try {
      sessionStorage.setItem("incomingRequests", JSON.stringify(incomingUsers.filter(Boolean)));
      sessionStorage.setItem("outgoingRequests", JSON.stringify(cleanedOutgoing));
    } catch (err) {
      console.warn("Failed to save friend requests to cache:", err);
    }

    setLoadingIncoming(false);
    setLoadingOutgoing(false);
  };

  /* ==========================
           UI
  =========================== */
  const formatDate = (iso) => {
    if (!iso) return "";
    return iso.split("T")[0]; // lấy phần trước chữ T
  };
  const UserItem = ({ item }) => (
    <div className="flex items-center gap-3 p-2 border-b">
      <img
        src={item.profile_picture_url || "/prvlocket.png"}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex-1">
        <p className="font-semibold">
          {item.first_name || item.username || "Unknown"}{" "}
          {item.last_name} {"- "}
           Đã gửi: {formatDate(item.date)}
        </p>

        <p className="text-gray-500 text-sm">
          {item.username ? `@${item.username}` : "Chưa có username"}
        </p>
      </div>
    </div>
  );


  return (
    <div className="w-full px-1 mt-3">
      <div className="w-full border rounded-xl p-3">
        <div
          className="flex justify-between items-center cursor-pointer select-none"
          onClick={() => {
            setExpanded((prev) => !prev);
            if (!expanded) fetchAll();
          }}
        >
          <p className="font-semibold text-base">Lời mời & Yêu cầu kết bạn</p>

          <div
            className={`transform transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          >
            <ChevronDown size={20} />
          </div>
        </div>

        <div
          className={`transition-all overflow-y-auto ${
            expanded ? "max-h-[350px] mt-3" : "max-h-0"
          }`}
        >
          {/* INCOMING */}
          <div>
            <p className="font-semibold text-sm mb-2">Lời mời kết bạn</p>
            {loadingIncoming ? (
              <p className="text-gray-500 p-2">Đang tải...</p>
            ) : incoming.length === 0 ? (
              <p className="text-gray-400 p-2">Không có lời mời</p>
            ) : (
              incoming.map((u) => <UserItem key={u.uid} item={u} />)
            )}
          </div>

          {/* OUTGOING */}
          <div className="mt-4">
            <p className="font-semibold text-sm mb-2">Yêu cầu đã gửi</p>
            {loadingOutgoing ? (
              <p className="text-gray-500 p-2">Đang tải...</p>
            ) : outgoing.length === 0 ? (
              <p className="text-gray-400 p-2">Chưa gửi yêu cầu nào</p>
            ) : (
              outgoing.map((u) => <UserItem key={u.uid} item={u} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(FriendRequests);
