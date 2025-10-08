import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import api from "../../../../../src/lib/axios";
import { API_URL } from "../../../../utils/API/apiRoutes";
import clsx from "clsx";
import axios from "axios";


import formatTime from "./formatTime";

const Activityavt = ({ isOpen, onClose, momentId, friendDetails, user }) => {
  const [activityData, setActivityData] = useState({ reactions: [], views: [] });
  const [loading, setLoading] = useState(false);

  const resolveUserInfo = useMemo(() => {
    const map = new Map();
    try {
      (friendDetails || []).forEach((f) => {
        const name =
          `${f.firstName || ""} ${f.lastName || ""}`.trim() ||
          f.username ||
          f.display_name ||
          f.uid ||
          "Người dùng";
        const avatar = f.profilePic || f.avatar || "/prvlocket.png";
        if (f.uid) map.set(String(f.uid), { name, avatar });
        if (f.username) map.set(String(f.username), { name, avatar });
      });
    } catch {}

    if (user) {
      const selfName = user.display_name || user.username || user.email || "Bạn";
      const selfAvatar = user.photoURL || user.avatar || "/prvlocket.png";
      if (user.localId) map.set(String(user.localId), { name: selfName, avatar: selfAvatar });
      if (user.username) map.set(String(user.username), { name: selfName, avatar: selfAvatar });
    }

    return (identifier) =>
      map.get(String(identifier)) || { name: "Người dùng", avatar: "/prvlocket.png" };
  }, [friendDetails, user]);

  useEffect(() => {
    const fetchActivityData = async () => {
      if (!momentId) return;
      try {
        setLoading(true);

        const token =
          localStorage.getItem("idToken") 
        if (!token) throw new Error("Không có token trong localStorage");

        const res = await axios.post(
          API_URL.INFO_REACTION_URL,
          { idMoment: momentId },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data?.success) {
          setActivityData({
            reactions: res.data.data.reactions || [],
            views: res.data.data.views || [],
          });
        }
      } catch (error) {
        console.error("Error fetching activity data:", error?.response?.data || error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData(); // 👉 gọi luôn khi momentId thay đổi
  }, [momentId]);


  // if (!isOpen) return null;

  // --- Gộp và sắp xếp dữ liệu ---
  const combinedUsers = (() => {
    const { reactions, views } = activityData;

    const reactionIds = reactions.map(r => r.user);
    const all = views.map(v => ({
      userId: v.user,
      reacted: reactionIds.includes(v.user),
      emoji: reactions.find(r => r.user === v.user)?.emoji || null,
      viewedAt: v.viewedAt || null,
      reactedAt: reactions.find(r => r.user === v.user)?.createdAt || null,
    }));

    // Nếu có user chỉ reaction mà không có trong views → thêm vào
    reactions.forEach(r => {
      if (!all.find(u => u.userId === r.user)) {
        all.push({
          userId: r.user,
          reacted: true,
          emoji: r.emoji,
          viewedAt: null,
          reactedAt: r.createdAt,
        });
      }
    });

    // Sắp xếp: reacted trước → theo reactedAt/viewedAt mới nhất
    return all.sort((a, b) => {
      if (a.reacted && !b.reacted) return -1;
      if (!a.reacted && b.reacted) return 1;
      const timeA = new Date(a.reactedAt || a.viewedAt || 0).getTime();
      const timeB = new Date(b.reactedAt || b.viewedAt || 0).getTime();
      return timeB - timeA;
    });
  })();



      
      return (
        <div className="">
          {loading ? (
            <div className="">
              
            </div>
          ) : combinedUsers.length > 0 ? (
            <div className="flex -space-x-2">
              {combinedUsers.map((u, i) => {
                const info = resolveUserInfo(u.userId);
                return (
                  <img
                    key={i}
                    src={info.avatar}
                    className={clsx(
                      "w-10 h-10 rounded-full border border-base-100 object-cover",
                      i > 0 && "-ml-[10px]",
                      i >= 5 && "hidden" // ẩn avatar từ số 6 trở đi
                    )}
                    onError={(e) => {
                      e.target.src = "/prvlocket.png";
                    }}
                  />
                );
              })}
            </div>

          ) : (
            <p>
            </p>
          )}
        </div>
      );
};

export default Activityavt;
