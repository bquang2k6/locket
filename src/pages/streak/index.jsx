import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FlameIcon.css";
import { API_URL } from "../../utils/API/apiRoutes";

export default function Streak() {
  const [streakCount, setStreakCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOutdated, setIsOutdated] = useState(false); // thêm state này

  useEffect(() => {
    const fetchStreak = async () => {
        try {
        const token =
            localStorage.getItem("authToken") || localStorage.getItem("idToken");
        if (!token) {
            console.warn("⚠️ Thiếu token đăng nhập");
            setLoading(false);
            return;
        }

        const res = await axios.post(
            API_URL.GET_LATEST_MOMENT,
            {
            data: {
                excluded_users: [],
                fetch_streak: true,
                should_count_missed_moments: true,
            },
            },
            {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            }
        );

        const streak = res?.data?.result?.streak;

        if (streak && typeof streak.count === "number") {
            setStreakCount(streak.count);

            const today = new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "");
            const lastUpdated = String(streak.last_updated_yyyymmdd); // ép sang chuỗi

            setIsOutdated(lastUpdated !== today);
        } else {
            console.warn("Không tìm thấy streak trong response:", res.data);
        }
        } catch (err) {
        console.error("❌ Lỗi khi fetch streak:", err);
        } finally {
        setLoading(false);
        }
    };

    fetchStreak();
    }, []);


  // 👇 Nếu isOutdated thì dùng màu xám thay vì tím
  const flameColor = isOutdated
    ? {
        from: "from-gray-400",
        via: "via-gray-500",
        to: "to-gray-600",
        text: "text-gray-100",
        shadow:
          "0 0 8px rgba(150,150,150,1), 0 0 15px rgba(150,150,150,1), 1.5px 1.5px 0px #777, -1px -1px 0px #999",
      }
    : {
        from: "from-purple-300",
        via: "via-purple-500",
        to: "to-purple-600",
        text: "text-white",
        shadow:
          "0 0 8px rgba(255, 0, 191, 1), 0 0 15px rgba(168, 85, 247, 0.6), 1.5px 1.5px 0px #a855f7, -1px -1px 0px #ab56ffff",
      };

  return (
    <div className="inline-block relative w-15 h-15">
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`absolute w-20 h-20 bg-gradient-to-t ${flameColor.from} ${flameColor.via} ${flameColor.to} rounded-full blur-md opacity-60 animate-pulse`}
          ></div>

          <div
            className={`absolute w-16 h-18 bg-gradient-to-t ${flameColor.from} ${flameColor.via} ${flameColor.to} rounded-full blur-sm opacity-80 animate-pulse`}
            style={{ animationDelay: "0.3s" }}
          ></div>

          <div
            className={`absolute w-14 h-16 bg-gradient-to-t ${flameColor.from} ${flameColor.via} ${flameColor.to} opacity-90`}
            style={{
              clipPath:
                "polygon(50% 0%, 80% 30%, 100% 60%, 80% 80%, 50% 100%, 20% 80%, 0% 60%, 20% 30%)",
              animation: "flicker 1.5s ease-in-out infinite",
            }}
          ></div>
          
          <div
            className={`absolute w-8 h-12 rounded-full bg-gradient-to-t ${flameColor.to} via-white to-transparent opacity-80`}
            style={{
            clipPath:
                "polygon(50% 10%, 65% 30%, 75% 55%, 60% 80%, 50% 95%, 40% 80%, 25% 55%, 35% 30%)",
            animation: "flicker 1.3s ease-in-out infinite reverse",
            }}
        ></div>
        </div>

        <div
          className={`relative z-10 text-2xl font-black ${flameColor.text}`}
          style={{
            textShadow: flameColor.shadow,
            WebkitTextStroke: "1px #a855f7",
          }}
        >
          {loading ? "..." : streakCount}
        </div>
      </div>
    </div>
  );
}
