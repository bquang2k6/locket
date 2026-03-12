import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../../../utils/API/apiRoutes";
import PostCard from "./PostCard";
import WeekPicker from "../../../components/rollcall/WeekPicker";
import { useApp } from "../../../context/AppContext";
import { ChevronLeft, Calendar, RefreshCw, ChevronDown } from "lucide-react";

const RollCall = () => {
  const { navigation } = useApp();
  const { setIsHomeOpen } = navigation;
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Week Selector State
  const [selectedWeek, setSelectedWeek] = useState(5);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [isWeekPickerOpen, setIsWeekPickerOpen] = useState(false);

  // Fetch posts when dependencies change or called manually
  const fetchPosts = async (week = selectedWeek, year = selectedYear) => {
    const token = localStorage.getItem("idToken");
    if (!token) return;

    try {
      setLoadingPosts(true);
      const res = await axios.post(
        API_URL.ROLLCALL_POSTS,
        { data: { week_of_year: week, year: year } },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.result?.data?.posts) {
        setPosts(res.data.result.data.posts);
      } else {
        setPosts([]); // Clear posts if no data
      }
    } catch (err) {
      console.error(err);
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleWeekSelect = ({ data }) => {
    const { week_of_year, year } = data;
    setSelectedWeek(week_of_year);
    setSelectedYear(year);
  };

  return (
    <div className="h-screen bg-base-200 flex flex-col items-center relative">
      {/* Week Selector & Fetch Header */}
      <div className="w-full px-4 py-4 z-10 flex items-center border-b border-base-content/5 bg-base-100/30 backdrop-blur-xl relative">
        <button
          onClick={() => setIsHomeOpen(false)}
          className="p-2 hover:bg-base-content/5 rounded-full transition-all text-base-content/70 active:scale-90 absolute left-4"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex items-center gap-2 mx-auto pl-8">
          <button
            onClick={() => setIsWeekPickerOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 shadow-sm bg-base-100/80 border border-base-content/10 rounded-full text-base-content/70 text-sm font-bold hover:bg-base-100 transition-all active:scale-95"
          >
            <span>Week {selectedWeek}, {selectedYear}</span>
            <ChevronDown size={14} />
          </button>

          <button
            onClick={() => fetchPosts()}
            disabled={loadingPosts}
            className="w-9 h-9 flex items-center justify-center shadow-sm bg-base-100/80 border border-base-content/10 rounded-full text-base-content/70 transition-all hover:bg-base-100 active:scale-90"
          >
            {loadingPosts ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <RefreshCw size={18} />
            )}
          </button>
        </div>
      </div>

      <WeekPicker
        isOpen={isWeekPickerOpen}
        onClose={() => setIsWeekPickerOpen(false)}
        currentWeek={selectedWeek}
        currentYear={selectedYear}
        onSelect={handleWeekSelect}
      />

      {/* Danh sách post */}
      <div className="w-full max-w-md flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {posts.map((post) => (
          <PostCard key={post.uid} post={post} />
        ))}
      </div>

      {/* Overlay blur + thông báo */}
      <div className="absolute inset-0 backdrop-blur-xl bg-black/40 flex items-center justify-center z-50 px-6">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-3">
            ⚠️ Tính năng đã dừng hoạt động trên phiên bản web
          </h2>

          <p className="text-gray-700 mb-4">
            Tính năng Rollcall hiện không hoạt động.
            <br />
            Vui lòng sử dụng <b>Locket Wan Android</b> để tiếp tục sử dụng.
          </p>

          <p className="text-sm text-gray-500">
            Phiên bản Android của Locket Wan vừa được phát hành.
          </p>

          <a
            href="/download-apk"
            className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Tải ứng dụng Android
          </a>
        </div>
      </div>
    </div>
  );
};

export default RollCall;
