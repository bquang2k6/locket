import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../../../utils/API/apiRoutes";
import PostCard from "./PostCard";

const RollCall = () => {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const fetchPosts = async () => {
    const token = localStorage.getItem("idToken");
    if (!token) return;

    try {
      setLoadingPosts(true);
      const res = await axios.post(
        API_URL.ROLLCALL_POSTS,
        { data: { week_of_year: 4, year: 2026 } },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.result?.data?.posts) {
        setPosts(res.data.result.data.posts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  return (
    <div className="h-screen bg-base-200">
      {/* Nút gọi API */}
      <div className="p-4">
        <button
          onClick={fetchPosts}
          className="btn btn-primary"
          disabled={loadingPosts}
        >
          {loadingPosts ? "Đang tải..." : "Lấy danh sách rollcall"}
        </button>
      </div>

      {/* Danh sách bài post */}
      <div className="overflow-y-scroll snap-y snap-mandatory h-[calc(100vh-80px)]">
        {posts.map((post) => (
          <PostCard key={post.uid} post={post} />
        ))}
      </div>
    </div>
  );
};

export default RollCall;
