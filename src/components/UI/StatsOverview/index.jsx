import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const StatsOverview = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // fetch("http://localhost:3000/api/return")
    fetch("https://return-locket.vercel.app/api/return")
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // ⛔ CHẶN SỚM – chưa có data thì KHÔNG làm gì tiếp
  if (!data) {
    return (
      <div className="text-center text-base-content/60">
        Đang tải thống kê...
      </div>
    );
  }

  // ✅ CHỈ destructure SAU KHI data ĐÃ TỒN TẠI
  const { stats, top_users, top_day } = data;
    const topDayText = top_day
        ? `${top_day.day} • ${top_day.count} bài`
        : "--";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="max-w-7xl w-full mx-auto mt-10"
    >
      <h2 className="text-2xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
        Thống kê hoạt động (23/12 → 02/02)
      </h2>

      {/* Tổng quan */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Lượt đăng nhập", value: stats.login, icon: "🔑" },
          { label: "Tổng ảnh đã đăng", value: stats.post_image, icon: "🖼️" },
          { label: "Tổng video đã đăng", value: stats.post_video, icon: "🎬" },
          { value: topDayText, icon: "🔥", label: "Ngày có lượt đăng nhiều nhất" },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="p-4 rounded-xl bg-base-100/80 backdrop-blur
              shadow-md border border-base-300
              flex items-center gap-3"
          >
            <div className="text-2xl">{item.icon}</div>
            <div>
              <div className="text-xs text-base-content/60">
                {item.label}
              </div>
              <div className="text-xl font-bold text-primary leading-tight">
                {item.value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top user */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl bg-base-100 shadow-xl border border-base-300">
          <h3 className="text-xl font-semibold mb-4">
            🏆 Top người đăng nhiều nhất
          </h3>
          <ul className="space-y-3">
            {top_users.map((u, i) => (
                <li
                key={u.userId}
                className="flex items-center justify-between
                    bg-base-200/50 rounded-xl px-4 py-3"
                >
                {/* Left: avatar + info */}
                <div className="flex items-center gap-3">
                    <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover border border-base-300"
                    />

                    <div className="leading-tight">
                    <div className="font-semibold text-base-content">
                        #{i + 1} {u.name}
                    </div>
                    <div className="text-sm text-base-content/60">
                        @{u.username}
                    </div>
                    </div>
                </div>

                {/* Right: count */}
                <span className="badge badge-primary badge-lg">
                    {u.count} bài
                </span>
                </li>
            ))}
          </ul>

        </div>
      </div>
    </motion.div>
  );
};

export default StatsOverview;
