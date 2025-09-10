import React, { useContext, useEffect, useMemo, useState } from "react";
import { MoreHorizontal, MessageCircle, Trash2, LayoutGrid, Send } from "lucide-react";
import { AuthContext } from "../../../context/AuthLocket";
import { useApp } from "../../../context/AppContext";
import { showSuccess } from "../../../components/Toast";
import BadgePlan from "./Badge";
import WeatherIcon from "../../../components/UI/WeatherIcon";
import { API_URL } from "../../../utils/API/apiRoutes";
import api from "../../../lib/axios";
import ThemeSelector from "../../../components/Theme/ThemeSelector";

const BottomHomeScreen = () => {
  const { user, friendDetails } = useContext(AuthContext);
  const { navigation, post } = useApp();
  const { isBottomOpen, setIsBottomOpen } = navigation;
  const { recentPosts, setRecentPosts } = post;

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedAnimate, setSelectedAnimate] = useState(false);
  const [imageInfo, setImageInfo] = useState(null);
  const [serverMoments, setServerMoments] = useState([]);
  const [loadingServer, setLoadingServer] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactionInput, setReactionInput] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const quickEmojis = ["💛", "🤣", "😍", "😊", "👏", "🔥", "❤️", "😢", "😮", "😡"];

  // Load local + cache khi mở bottom sheet
  useEffect(() => {
    if (isBottomOpen) {
      const localData = JSON.parse(localStorage.getItem("uploadedMoments") || "[]").reverse();
      setRecentPosts(localData);
      const cachedServer = JSON.parse(localStorage.getItem("serverMoments") || "[]");
      setServerMoments(cachedServer);
    }
  }, [isBottomOpen, setRecentPosts]);

  // Chuẩn hoá dữ liệu từ server
  const transformServerMoment = (m) => {
    const overlay = m.overlays || null;
    const captionText = overlay?.text || m.caption || "";
    const captionItem = captionText
      ? {
          caption: captionText,
          text: captionText,
          text_color: overlay?.textColor || "#FFFFFFE6",
          background: { colors: overlay?.background?.colors || [] },
          icon: overlay?.icon || null,
          type: overlay?.type || "caption",
        }
      : null;

    return {
      _origin: "server",
      id: m.id,
      user: m.user,
      image_url: m.thumbnailUrl || null,
      thumbnail_url: m.thumbnailUrl || null,
      video_url: m.videoUrl || null,
      date: m.date || m.createTime || new Date().toISOString(),
      md5: m.md5 || null,
      captions: captionItem ? [captionItem] : [],
    };
  };

  // Lấy moments từ server
  const fetchServerMoments = async () => {
    try {
      setLoadingServer(true);
      const res = await api.post(String(API_URL.GET_MOMENT_URL), {
        limit: 50,
        pageToken: null,
        userUid: null,
      });
      const data = res?.data?.data || [];
      const mapped = Array.isArray(data) ? data.map(transformServerMoment) : [];
      setServerMoments(mapped);
      localStorage.setItem("serverMoments", JSON.stringify(mapped));
      showSuccess("Đã cập nhật bài viết từ server!");
    } catch (e) {
      console.error("Fetch server moments failed", e?.response?.data || e);
      setServerMoments([]);
    } finally {
      setLoadingServer(false);
    }
  };

  // Gửi reaction
  async function sendReaction(momentId, emoji) {
    try {
      const res = await api.post(String(API_URL.SEND_REACTION_URL), {
        emoji: emoji,
        moment_id: momentId,
        intensity: 0,
      });
      console.log("Reaction sent:", res.data);
      showSuccess(`Đã gửi reaction ${emoji}!`);
    } catch (err) {
      console.error("Failed to send reaction:", err);
    }
  }

  const handleSendReaction = async () => {
    if (!imageInfo || !(selectedEmoji || reactionInput)) {
      alert("Vui lòng chọn emoji trước khi gửi!");
      return;
    }
    const emojiToSend = selectedEmoji || reactionInput;
    await sendReaction(imageInfo.id, emojiToSend);
    setSelectedEmoji("");
    setReactionInput("");
    setShowEmojiPicker(false);
  };

  // Xoá cache local
  const handleClearCache = () => {
    try {
      localStorage.removeItem("uploadedMoments");
      setRecentPosts([]);
      setSelectedImage(null);
      setSelectedVideo(null);
      setImageInfo(null);
      showSuccess("Đã xoá cache ảnh local.");
    } catch (e) {
      console.error("Clear cache failed", e);
    }
  };

  const handleClick = () => setIsBottomOpen(false);

  // Mở media modal
  const handleOpenMedia = (item) => {
    setSelectedAnimate(true);
    if (item.video_url) {
      setSelectedVideo(item.video_url);
      setSelectedImage(null);
    } else {
      setSelectedImage(item.image_url || item.thumbnail_url);
      setSelectedVideo(null);
    }
    setImageInfo(item);
    setShowEmojiPicker(false);
    setReactionInput("");
  };

  const handleCloseMedia = () => {
    setSelectedAnimate(false);
    setShowEmojiPicker(false);
    setReactionInput("");
    setTimeout(() => {
      setSelectedImage(null);
      setSelectedVideo(null);
      setImageInfo(null);
    }, 400);
  };

  // Xoá ảnh local
  const handleDeleteImage = (id) => {
    const updated = recentPosts.filter((p) => p.id !== id);
    setRecentPosts(updated);
    localStorage.setItem("uploadedMoments", JSON.stringify(updated));
    showSuccess("Xóa ảnh thành công!");
    handleCloseMedia();
  };

  const displayPosts = [...serverMoments, ...recentPosts];

  const resolveUserInfo = useMemo(() => {
    const map = new Map();
    try {
      (friendDetails || []).forEach((f) => {
        const name = `${f.firstName || ""} ${f.lastName || ""}`.trim() || f.username || f.display_name || f.uid || "Người dùng";
        const avatar = f.profilePic || f.avatar || "./prvlocket.png";
        if (f.uid) map.set(String(f.uid), { name, avatar });
        if (f.username) map.set(String(f.username), { name, avatar });
      });
    } catch {}
    // also index current user as fallback
    if (user) {
      const selfName = user.display_name || user.username || user.email || "Bạn";
      const selfAvatar = user.photoURL || user.avatar || "./prvlocket.png";
      if (user.localId) map.set(String(user.localId), { name: selfName, avatar: selfAvatar });
      if (user.username) map.set(String(user.username), { name: selfName, avatar: selfAvatar });
    }
    return (identifier) => {
      if (!identifier) return { name: "Người dùng", avatar: "/prvlocket.png" };
      if (typeof identifier === "string") {
        return map.get(identifier) || { name: identifier, avatar: "/prvlocket.png" };
      }
      if (typeof identifier === "object") {
        const byUid = identifier.uid && map.get(String(identifier.uid));
        if (byUid) return byUid;
        const byUsername = identifier.username && map.get(String(identifier.username));
        if (byUsername) return byUsername;
        const name = identifier.display_name || identifier.name || identifier.username || identifier.uid || "Người dùng";
        const avatar = identifier.profilePic || identifier.avatar || "/prvlocket.png";
        return { name, avatar };
      }
      return { name: String(identifier), avatar: "/prvlocket.png" };
    };
  }, [friendDetails, user]);

  return (
    <div
      className={`fixed inset-0 flex flex-col transition-all duration-500 z-50 bg-base-100 ${
        isBottomOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col shadow px-4 py-2 text-base-content relative">
        <div className="flex items-center justify-between">
          <BadgePlan />
          <button className="rounded-full p-2 bg-base-200">
            <MessageCircle size={26} />
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-2 pt-4">
        <button
          className="btn btn-sm btn-primary"
          onClick={fetchServerMoments}
          disabled={loadingServer}
        >
          {loadingServer ? "Đang tải..." : "Lấy bài viết"}
        </button>
        <button className="btn btn-sm btn-secondary" onClick={handleClearCache}>
          Xoá Cache
        </button>
      </div>

      {/* Media grid */}
      <div
        className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 p-2 overflow-y-auto transition-all ${
          selectedAnimate ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        
      >
        {loadingServer && <div className="col-span-full text-center py-4">Đang tải lịch sử...</div>}
        {!loadingServer && displayPosts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center text-center py-6">
            <span className="text-base-content/70 font-semibold">
              Chưa có ảnh nào, hãy đăng ảnh để xem nhé!
            </span>
          </div>
        ) : (
          displayPosts.map((item, index) => (
            <div
              key={`bottom-post-${item._origin || "mix"}-${item.id}-${index}`}
              className="aspect-square cursor-pointer"
              onClick={() => handleOpenMedia(item)}
            >
              <div className="relative w-full h-full border-2 border-base-300 rounded-2xl overflow-hidden">
                {item.video_url ? (
                  <video
                    src={item.video_url}
                    className="object-cover w-full h-full"
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={item.thumbnail_url || item.image_url}
                    alt={item.captions?.[0]?.text || "Image"}
                    className="object-cover w-full h-full"
                  />
                )}
                <div className="absolute top-1 right-1 bg-base-300/70 text-base-content px-2 py-0.5 rounded-full text-[10px]">
                  {new Date(item.date).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Full media modal */}
      {selectedAnimate && imageInfo && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-base-100/90 z-50 p-4">
          <div className="relative w-full max-w-md aspect-square border-4 border-primary rounded-[50px] overflow-hidden">
            {selectedVideo ? (
              <video src={selectedVideo} autoPlay loop className="object-contain w-full h-full" />
            ) : (
              <img src={selectedImage} alt="Selected" className="object-contain w-full h-full" />
            )}
            <div className="absolute top-2 right-3 bg-base-300/80 text-base-content px-2 py-1 rounded-full text-xs">
              {new Date(imageInfo.date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
            </div>

            {/* Caption hiển thị */}
            {imageInfo.captions?.[0] && (
              <div className="absolute left-1/2 bottom-[10px] transform -translate-x-1/2">
                <div
                  className={`flex flex-col items-center px-4 py-2 rounded-full font-semibold border-2 ${
                    imageInfo.captions[0].background?.colors?.length
                      ? "border-transparent"
                      : "border-secondary bg-base-300/70 text-base-content backdrop-blur-3xl"
                  }`}
                  style={{
                    background: imageInfo.captions[0].background?.colors?.length
                      ? `linear-gradient(to bottom, ${imageInfo.captions[0].background.colors[0]}, ${imageInfo.captions[0].background.colors[1]})`
                      : undefined,
                    color: imageInfo.captions[0].text_color || undefined,
                  }}
                >
                  {(() => {
                    const icon = imageInfo.captions[0].icon;
                    if (!icon) return null;
                    if (typeof icon === "string" || typeof icon === "number") {
                      return <span className="text-lg">{icon}</span>;
                    }
                    if (typeof icon === "object") {
                      if (icon.type === "image" && icon.data) {
                        return (
                          <img
                            src={icon.data}
                            alt="Icon"
                            className="w-6 h-6 object-cover"
                          />
                        );
                      }
                      if (icon.type === "weather") {
                        return (
                          <WeatherIcon
                            weatherCode={icon.data || icon.code}
                            className="w-6 h-6"
                          />
                        );
                      }
                      if (icon.emoji) {
                        return <span className="text-lg">{icon.emoji}</span>;
                      }
                    }
                    return null;
                  })()}
                  <span>{imageInfo.captions[0].caption}</span>
                </div>
              </div>
            )}
          </div>

          {imageInfo.user && (() => {
            const info = resolveUserInfo(imageInfo.user);
            // return (
            //   <div className="mt-4 border border-secondary bg-base-300/70 text-base-content px-3 py-1 rounded-full flex items-center gap-2 text-sm mb-40">
            //     {info.avatar ? (
            //       <img src={info.avatar} alt={info.name} className="w-6 h-6 rounded-full border border-base-300 object-cover" />
            //     ) : (
            //       <div className="w-6 h-6 bg-base-200 rounded-full flex items-center justify-center" />
            //     )}
            //     <span>{info.name}</span>
            //   </div>
            // );

          })()}


          {/* Emoji reaction input */}
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-80">
          <div className="bg-base-300/90 backdrop-blur-sm rounded-full px-4 py-2 border border-base-300 flex items-center gap-1 mb-10">
    {/* Input field */}
    <input
      type="text"
      placeholder="Nhập icon"
      value={reactionInput}
      onChange={(e) => setReactionInput(e.target.value)}
      className="flex-1 bg-transparent text-base-content placeholder:text-base-content/60 outline-none text-sm min-w-0"
    />
    
    {/* Quick emoji buttons - inline */}
    <div className="flex items-center gap-1">
      {quickEmojis.slice(0, 4).map((emoji) => (
        <button
          key={emoji}
          onClick={async () => {
            if (!imageInfo) return;
            setSelectedEmoji(emoji);
            setReactionInput(emoji);
            await sendReaction(imageInfo.id, emoji);
            // Reset sau khi gửi
            setTimeout(() => {
              setSelectedEmoji("");
              setReactionInput("");
            }, 1000);
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-lg hover:bg-base-200 transition-all duration-200 ${
            selectedEmoji === emoji ? "bg-primary/30 scale-110" : "hover:scale-105"
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>

    {/* Send button */}
    <button
      onClick={handleSendReaction}
      disabled={!selectedEmoji && !reactionInput.trim()}
      className="w-8 h-8 rounded-full bg-primary text-primary-content hover:bg-primary/90 disabled:bg-base-300 disabled:text-base-content disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-105"
    >
      <Send size={14} />
    </button>
  </div>

            {/* Expanded emoji picker */}
  {showEmojiPicker && (
    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-base-300/95 backdrop-blur-sm rounded-2xl p-3 border border-base-300 shadow-lg">
      <div className="grid grid-cols-5 gap-2">
        {quickEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              setSelectedEmoji(emoji);
              setReactionInput(emoji);
              setShowEmojiPicker(false);
            }}
            className="w-10 h-10 rounded-lg hover:bg-base-200 text-xl transition-all duration-200 hover:scale-110 flex items-center justify-center"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )}
          </div>
        </div>
      )}


      {/* Bottom Button luôn nổi trên modal */}
    <div className="flex flex-col shadow-lg px-4 py-2 text-base-content overflow-hidden bottom-0 fixed w-full z-[9999]">
      <div className="flex items-center justify-between">
        {/* Close button */}
        <button
          className="p-1 text-base-content tooltip tooltip-right cursor-pointer"
          onClick={handleCloseMedia}
          data-tip="Bấm để xem danh sách lưới"
        >
          <LayoutGrid size={30} />
        </button>

        {/* Nút tròn ở giữa */}
        <div className="flex items-center justify-center h-full w-full">
          <div className="scale-75">
            <button
              onClick={handleClick}
              className="relative flex items-center justify-center w-22 h-22"
            >
              <div className="absolute w-22 h-22 border-4 border-base-content/50 rounded-full z-10"></div>
              <div className="absolute rounded-full btn w-18 h-18 outline-accent bg-base-content z-0"></div>
            </button>
          </div>
        </div>

        {/* More button */}
        <button
          className="p-2 text-base-content rounded-full border-3 border-base-content bg-transparent tooltip tooltip-left cursor-pointer shadow"
          onClick={handleCloseMedia}
          data-tip="Chức năng đang phát triển"
        >
          <MoreHorizontal size={18} />
        </button>

        {/* Delete button (chỉ cho ảnh local) */}
        {imageInfo && imageInfo._origin !== "server" && (
          <button
            className="p-1 text-base-content tooltip-left tooltip cursor-pointer"
            onClick={() => {
              if (imageInfo && imageInfo.id) {
                handleDeleteImage(imageInfo.id);
              } else {
                alert("Vui lòng chọn ảnh trước khi xóa!");
              }
            }}
            data-tip="Bấm để xoá ảnh"
          >
            <Trash2 size={30} />
          </button>
        )}
      </div>
    </div>


  </div>
  );
};

export default BottomHomeScreen;
