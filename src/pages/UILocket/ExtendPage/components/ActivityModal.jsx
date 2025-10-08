import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import api from "../../../../../src/lib/axios";
import { API_URL } from "../../../../utils/API/apiRoutes";
import axios from "axios";

import formatTime from "./formatTime";

const ActivityModal = ({ isOpen, onClose, momentId, friendDetails, user }) => {
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
    if (isOpen) fetchActivityData();
  }, [isOpen, momentId]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-base-100 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h2 className="text-lg font-semibold text-base-content">Hoạt động</h2>
          <button onClick={onClose} className="p-2 hover:bg-base-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[400px] p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : combinedUsers.length > 0 ? (
            combinedUsers.map((u, i) => {
              const info = resolveUserInfo(u.userId);
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={info.avatar}
                      alt={info.name}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    
                  </div>
                  <div>
                    <p className="font-medium">{info.name}</p>
                    <p className="text-xs text-base-content/60">
                      {u.reacted
                        ? `Đã thả reaction ${u.emoji} • ${formatTime(u.reactedAt)}`
                        : `Đã xem • ${formatTime(u.viewedAt)}`}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-base-content/60">
              Chưa có ai xem hoặc thả cảm xúc
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;
