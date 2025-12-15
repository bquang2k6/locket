import React, { useMemo } from "react";
import Stack from "../../Public/Rollcall/Stack";
import { useHeicImages } from "./hook";
import { MessageCircle } from "lucide-react";
import formatTime from "./hook/formatTime";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthLocket";

const PostCard = ({ post }) => {
    const { friendDetails } = useContext(AuthContext);
    const userInfo = friendDetails.find((f) => f.uid === post.user) || {
        firstName: "Người dùng",
        lastName: "",
        profilePic: "/prvlocket.png",
    };
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

  const firstItem = post.items[0]; // Lấy item đầu tiên để tham khảo metadata

  return (
    <div className="h-screen snap-start flex flex-col items-center justify-center gap-4">
      {/* Khung cố định 80% màn hình */}
      <div
        className="relative rounded-xl"
        style={{
          width: "80vw",
          height: "80vh",
          maxWidth: firstItem.metadata?.width
            ? `${firstItem.metadata.width}px`
            : "80vw",
          maxHeight: firstItem.metadata?.height
            ? `${firstItem.metadata.height}px`
            : "80vh",
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
                  <div className="absolute bottom-3 left-3 flex gap-2 px-3 py-1 rounded-full text-white text-sm">
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

            {/* Nút Message cố định bên phải */}
            <button className="absolute right-[10px] top-1 text-gray-500 hover:text-black">
                <MessageCircle size={18} />
            </button>
        </div>

    </div>
  );
};

export default PostCard;
