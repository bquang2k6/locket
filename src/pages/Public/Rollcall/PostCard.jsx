import React, { useMemo, useState, useContext } from "react";
import Stack from "../../Public/Rollcall/Stack";
import { useHeicImages } from "./hook";
import { MessageCircle, Heart } from "lucide-react";
import formatTime from "./hook/formatTime";
import { AuthContext } from "../../../context/AuthLocket";
import axios from "axios";

const PostCard = ({ post, token }) => {
  const { friendDetails } = useContext(AuthContext);
  const userInfo = friendDetails.find((f) => f.uid === post.user) || {
    firstName: "Người dùng",
    lastName: "",
    profilePic: "/prvlocket.png",
  };

  const [showComments, setShowComments] = useState(false);
  const [commentUsers, setCommentUsers] = useState({}); 
  const [newComment, setNewComment] = useState(""); 
  const [comments, setComments] = useState(post.comments || []);

  const rawImages = useMemo(
    () => post.items.map((item) => item.main_url),
    [post.items]
  );

  const { images, loading } = useHeicImages(rawImages);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Đang xử lý ảnh...
      </div>
    );
  }

  const firstItem = post.items[0];

  const fetchCommentUsers = async () => {
    const usersToFetch = comments
      .map((c) => c.user)
      .filter((uid) => !commentUsers[uid]);

    const newCommentUsers = { ...commentUsers };
    const token = localStorage.getItem("idToken");

    for (let uid of usersToFetch) {
      try {
        const res = await axios.post(
          "https://api.locketcamera.com/fetchUserV2",
          { data: { user_uid: uid } },
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        const userData = res.data.result.data;
        newCommentUsers[uid] = {
          uid: userData.uid,
          firstName: userData.first_name,
          lastName: userData.last_name,
          profilePic: userData.profile_picture_url,
        };
      } catch (err) {
        console.error("Error fetching user", uid, err);
        newCommentUsers[uid] = { firstName: "Người dùng", lastName: "", profilePic: "/prvlocket.png" };
      }
    }

    setCommentUsers(newCommentUsers);
  };

  const handleCommentClick = async () => {
    if (!showComments) await fetchCommentUsers();
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const tempComment = {
      uid: Date.now().toString(),
      body: newComment,
      user: userInfo.uid,
      post_item_uid: firstItem.uid,
      likes: [],
      created_at: { _seconds: Math.floor(Date.now() / 1000) }
    };
    setComments([...comments, tempComment]);
    setNewComment("");
    if (!commentUsers[userInfo.uid]) {
      setCommentUsers({ ...commentUsers, [userInfo.uid]: userInfo });
    }
    try {
      const token = localStorage.getItem("idToken");
      await axios.post(
        "https://apilocketwan.traidep.site/locket/getRollcallcommnet",
        {
          data: {
            body: tempComment.body,
            post_item_uid: firstItem.uid,
            post_uid: post.uid,
            post_user_uid: userInfo.uid, // chính là người đăng comment
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Comment sent successfully");
    } catch (err) {
      console.error("Failed to send comment", err);
      // Nếu muốn rollback UI khi lỗi có thể xóa tempComment khỏi state
    }
  };

  return (
    <div className="h-screen snap-start flex flex-col items-center justify-center gap-4">
      {/* Khung ảnh */}
      <div
        className="relative rounded-xl"
        style={{
          width: "70vw",
          height: "70vh",
          maxWidth: firstItem.metadata?.width
            ? `${firstItem.metadata.width}px`
            : "70vw",
          maxHeight: firstItem.metadata?.height
            ? `${firstItem.metadata.height}px`
            : "70vh",
        }}
      >
        <Stack
          randomRotation
          sensitivity={180}
          sendToBackOnClick
          cards={images.map((src, i) => {
            const item = post.items[i];
            return (
              <div key={i} className="relative w-full h-full">
                <img
                  src={src}
                  alt={`card-${i + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                />
                {item.reactions && item.reactions.length > 0 && (
                  <div className="absolute bottom-3 left-2 flex px-1 py-1 rounded-full text-white text-xl">
                    {item.reactions.map((r) => r.reaction).join(" ")}
                  </div>
                )}
              </div>
            );
          })}
        />
      </div>

      {/* Thông tin người đăng */}
      <div className="w-[80vw] flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <img
            src={userInfo.profilePic}
            alt={`${userInfo.firstName} ${userInfo.lastName}`}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{userInfo.firstName} {userInfo.lastName}</span>
            </div>
            <span className="text-xs text-gray-500">
              {formatTime(post.created_at._seconds)}
            </span>
          </div>
        </div>

        {/* Nút comment */}
        <button
          onClick={handleCommentClick}
          className="absolute right-[10px] top-1 text-gray-500 hover:text-black flex items-center gap-1"
        >
          <MessageCircle size={18} />
          <span className="text-sm">{comments.length}</span> {/* số lượng comment */}
        </button>
      </div>

      {/* Hiển thị comment */}
      {showComments && (
  <div
    className="absolute inset-0 bg-black/40 flex justify-center items-end z-50"
    onClick={() => setShowComments(false)} // click vào background thì đóng
  >
    <div
      className="w-full bg-white/95 backdrop-blur-md border-t border-gray-200 p-2 flex flex-col gap-2 rounded-t-xl"
      style={{ height: "50%" }}
      onClick={(e) => e.stopPropagation()} // ngăn click vào box comment đóng overlay
    >
      {comments.map((c) => {
        const commenter = commentUsers[c.user] || {};
        return (
          <div key={c.uid} className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <img
                src={commenter.profilePic || "/prvlocket.png"}
                alt={`${commenter.firstName} ${commenter.lastName}`}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-sm">
                <span className="font-semibold">{commenter.firstName} {commenter.lastName}</span>: {c.body}
              </span>
            </div>
            <Heart size={16} className="text-pink-500" />
          </div>
        );
      })}

      {/* Input thêm comment */}
      <div className="flex gap-2 mt-auto">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Viết bình luận..."
          className="flex-1 border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <button
          onClick={handleAddComment}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
        >
          Gửi
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default PostCard;
