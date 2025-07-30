import React, { useEffect, useState, useContext } from "react";
import { Check, Download, Heart, MessageCircle, Send, Trash2 } from "lucide-react";
import { AuthContext } from "../../../../context/AuthLocket";
import { deleteCaptionPost } from "../../../../services/LocketDioService/PostMoments";
import { showSuccess, showError } from "../../../../components/Toast";
import { useApp } from "../../../../context/AppContext";
import WeatherIcon from "../../../../components/UI/WeatherIcon";

const ADMIN_USERNAME = "wan206";

const PostCard = ({ post, onDeleted }) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const { user } = useContext(AuthContext);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem("savedPosts") || "[]");
    const exists = savedPosts.some((p) => p.id === post.id);
    setIsDownloaded(exists);
  }, [post.id]);

  const toggleDownload = () => {
    const savedPosts = JSON.parse(localStorage.getItem("savedPosts") || "[]");

    if (isDownloaded) {
      const updated = savedPosts.filter((p) => p.id !== post.id);
      localStorage.setItem("savedPosts", JSON.stringify(updated));
    } else {
      // Lưu chỉ id và options
      const newEntry = { id: post.id, options: post.options };
      localStorage.setItem(
        "savedPosts",
        JSON.stringify([...savedPosts, newEntry])
      );
    }

    setIsDownloaded((prev) => !prev);
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa caption này?")) return;
    setIsDeleting(true);
    try {
      // Admin key từ config
      const adminKey = "header";
      await deleteCaptionPost(post.id, adminKey);
      showSuccess("Đã xóa caption thành công!");
      if (onDeleted) onDeleted(post.id);
    } catch (err) {
      showError("Xóa caption thất bại!");
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to get plan gradient color
  const getPlanGradient = (plan) => {
    const planLower = plan.toLowerCase();
    
    switch (planLower) {
      case "pro plus":
        return "linear-gradient(135deg,  #0250c5,  #d43f8d)"; // tím đậm gradient sang trọng
      case "premium":
        return "linear-gradient(135deg,   #7028e4,rgb(255, 189, 91))"; // vàng gold cao cấp
      case "premium lite":
        return "linear-gradient(135deg,rgb(197, 136, 107),rgb(146, 134, 24))"; // xanh tím elegant
      case "free":
        return "linear-gradient(135deg, #64748b, #94a3b8)"; // slate
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-3 ">
        <div className="flex items-center gap-3">
          <img
            src={post?.user_info?.profilePicture}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="text-sm font-semibold text-gray-800 flex items-center gap-1">
              {post?.user_info?.displayName || "Anonymous"}{" • "}
              <div className="flex items-center space-x-1">
                {/* Badge Admin */}
                {post?.user_info?.username === ADMIN_USERNAME && (
                  <span
                    className="px-2 py-0.5 text-xs rounded-full text-white font-semibold shadow-md"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, #FBBF24, #F97316)", // vàng-cam
                    }}
                  >
                    Admin
                  </span>
                )}

                {post?.user_info?.plan && 
                 post.user_info.plan !== "" && 
                 post.user_info.plan.toLowerCase() !== "no plan" && 
                 post.user_info.plan.toLowerCase() !== "none" ? (
                  <span
                    className="px-2 py-0.5 text-xs rounded-full font-semibold shadow-md text-white"
                    style={{
                      backgroundImage: getPlanGradient(post.user_info.plan)
                    }}
                  >
                    {post.user_info.plan.charAt(0).toUpperCase() +
                      post.user_info.plan.slice(1)}
                  </span>
                ) : (
                  <span 
                    className="px-2 py-0.5 text-xs rounded-full font-semibold shadow-md text-white"
                    style={{
                      backgroundImage: "linear-gradient(45deg, #64748B, #94A3B8)" // slate gradient cho No Plan
                    }}
                  >
                    No Plan
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              @{post?.user_info?.username || "Anonymus"}
            </p>
          </div>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(post.created_at).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>

      </div>

      {/* Caption Gradient */}
      <div className="w-full aspect-[2/0.5] flex items-center justify-center">
        <button
          className="flex flex-col whitespace-nowrap drop-shadow-lg items-center space-y-1 py-2 px-4 btn h-auto w-auto rounded-3xl font-semibold justify-center"
          style={{
            background: `linear-gradient(to bottom, ${post?.options?.color_top || '#000000'}, ${post?.options?.color_bottom || '#000000'})`,
            color: post?.options?.color_text || (() => {
              // Tự động tính toán màu chữ tương phản
              const bgColor = post?.options?.color_top || '#000000';
              const hex = bgColor.replace('#', '');
              const r = parseInt(hex.substr(0, 2), 16);
              const g = parseInt(hex.substr(2, 2), 16);
              const b = parseInt(hex.substr(4, 2), 16);
              const brightness = (r * 299 + g * 587 + b * 114) / 1000;
              return brightness > 128 ? '#000000' : '#FFFFFF';
            })(),
          }}
        >
          <span className="text-base flex items-center gap-2">
            {post?.options?.type === "weather" && post?.options?.icon ? (
              <WeatherIcon weatherCode={post.options.icon} className="w-5 h-5" />
            ) : post?.options?.icon ? (
              <span>{post.options.icon}</span>
            ) : null}
            {post?.options?.caption || post?.options?.caption || "Caption"}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-3 text-sm text-gray-800">{post.content}</div>

      <div className="px-4 pb-4 flex w-full justify-between items-center">
        <div className="flex gap-4 text-gray-600">
          <button className="flex items-center font-semibold gap-1 hover:text-pink-500">
            <Heart className="w-5 h-5" />
            <span>{post?.stats?.hearts || 0}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-blue-500">
            <MessageCircle className="w-5 h-5" />
            <span>{post?.stats?.comments || 0}</span>
          </button>
          <div className="flex items-center gap-1 font-semibold text-gray-500">
            <Download className="w-5 h-5" />
            <span>{post?.stats?.downloads || 0}</span>
          </div>
          <button className="flex items-center gap-1 hover:text-green-500">
            <Send className="w-5 h-5" />
            <span>{post?.stats?.shares || 0}</span>
          </button>
        </div>

        {/* Bên phải: lượt tải và nút tải/lưu */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDownload}
            className={`text-xs font-medium rounded-full px-3 py-1 border transition ${
              isDownloaded
                ? "bg-green-100 text-green-600 border-green-300"
                : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
            }`}
          >
            {isDownloaded ? (
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                Đã lưu
              </span>
            ) : (
              "Lưu"
            )}
          </button>
          
          {/* Nút xóa chỉ hiển thị với admin */}
          {user && user.username === ADMIN_USERNAME && (
            <button
              className="text-xs font-medium rounded-full px-3 py-1 border transition bg-red-100 text-red-600 border-red-300 hover:bg-red-200"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Xóa caption"
            >
              <span className="flex items-center gap-1">
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;