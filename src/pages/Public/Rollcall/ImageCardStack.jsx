import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../utils/API/apiRoutes";
import PostCard from "./PostCard";

const RollCall = () => {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem("idToken");
      if (!token) return;

      try {
        setLoadingPosts(true);
        const res = await axios.post(
          API_URL.ROLLCALL_POSTS,
          { data: { week_of_year: 51, year: 2025 } },
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

    fetchPosts();
  }, []);

  if (loadingPosts) {
    return (
      <div className="h-screen flex items-center justify-center">
        Đang tải bài đăng...
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-base-200">
      {posts.map((post) => (
        <PostCard key={post.uid} post={post} />
      ))}
    </div>
  );
};

export default RollCall;
