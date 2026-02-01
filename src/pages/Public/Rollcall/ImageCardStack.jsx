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
    <div className="h-screen bg-base-200 flex flex-col items-center">
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
            title="Lấy danh sách rollcall"
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

      {/* Loading State */}
      {loadingPosts && posts.length === 0 && (
        <div className="flex-1 flex justify-center items-center">
          <span className="loading loading-spinner loading-lg text-primary opacity-50"></span>
        </div>
      )}

      {/* Danh sách bài post */}
      {!loadingPosts && posts.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center text-base-content/30 gap-4">
          <div className="p-4 bg-base-content/5 rounded-full">
            <Calendar size={48} />
          </div>
          <p className="text-sm font-medium">Chưa có dữ liệu cho tuần này</p>
          <button
            onClick={() => fetchPosts()}
            className="btn btn-ghost btn-sm text-primary"
          >
            Tải lại ngay
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
          {posts.map((post) => (
            <PostCard key={post.uid} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RollCall;
