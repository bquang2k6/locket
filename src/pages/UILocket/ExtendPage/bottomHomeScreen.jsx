import React, { useContext, useEffect, useMemo, useState } from "react";
import { MoreHorizontal, MessageCircle, Trash2, LayoutGrid, Send, Activity, X, Eye, Heart } from "lucide-react";
import { AuthContext } from "../../../context/AuthLocket";
import { useApp } from "../../../context/AppContext";
import { showSuccess } from "../../../components/Toast";
import BadgePlan from "./Badge";
import WeatherIcon from "../../../components/UI/WeatherIcon";
import { API_URL } from "../../../utils/API/apiRoutes";
import api from "../../../lib/axios";
import ThemeSelector from "../../../components/Theme/ThemeSelector";
import ActivityModal from "./components/ActivityModal";
import Activityavt from "./components/Activityavt";
import HeaderBeforeCaptureavt from "./Header/HeaderBeforeCaptureavt";
import axios from "axios";
import * as LucideIcons from "lucide-react";

const BottomHomeScreen = () => {
  const { user, friendDetails } = useContext(AuthContext);
  const { navigation, post } = useApp();
  const { isBottomOpen, setIsBottomOpen } = navigation;
  const { recentPosts, setRecentPosts, selectedFriendUid } = post;

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

  // State cho activity modal
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [openActivity, setOpenActivity] = useState(false);

  const [pageToken, setPageToken] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  
  // REMOVED: const [setSelectedFriendUid] = useState(null); // This was causing the conflict!

  // Load local + cache khi mở bottom sheet
  useEffect(() => {
    if (isBottomOpen) {
      fetchServerMoments();
    }
  }, [isBottomOpen, setRecentPosts, selectedFriendUid]);

  //Hàm render icon
    const renderOverlayIcon = (icon) => {
    if (!icon) return null;

    // Emoji
    if (icon.type === "emoji") {
      return <span style={{ fontSize: 15 }}>{icon.data}</span>;
    }

    // SF Symbol → dùng icon trong lucide-react
    if (icon.type === "sf_symbol") {
      const name = icon.data.replace(".fill", ""); // Xử lý tên icon
      const IconComponent = LucideIcons[name];

      return IconComponent ? (
        <IconComponent size={20} color={icon.color || "#fff"} />
      ) : (
        <span>🕛</span>
      );
    }

    // Image icon
    if (icon.type === "image") {
      return (
        <img
          src={icon.data}
          alt="icon"
          style={{ width: 22, height: 22, objectFit: "contain" }}
        />
      );
    }

    return null;
  };


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
  const fetchServerMoments = async (append = false) => {
    try {
      setLoadingServer(true);
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("idToken");
      const res = await axios.post(
        API_URL.GET_MOMENTV2_URL,
        {
          limit: 50,
          pageToken: append ? pageToken : null,
          userId: user?.uid,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res?.data?.moments || [];
      const nextToken = res?.data?.nextPageToken || null;

      const mapped = Array.isArray(data) ? data.map(transformServerMoment) : [];

      setServerMoments((prev) => {
        const newList = append ? [...prev, ...mapped] : mapped;
        // localStorage.setItem("serverMoments", JSON.stringify(newList));
        return newList;
      });

      setPageToken(nextToken);
      setHasMore(!!nextToken); // nếu có nextToken → còn dữ liệu
      if (!append) showSuccess("Đã cập nhật bài viết !");
    } catch (e) {
      console.error("Fetch server moments failed", e?.response?.data || e);
      if (!append) setServerMoments([]);
    } finally {
      setLoadingServer(false);
    }
  };

  // Gửi reaction
  async function sendReaction(momentId, emoji) {
    try {
      const token =
      localStorage.getItem("authToken") || localStorage.getItem("idToken");

      const res = await axios.post(
        API_URL.SEND_REACTION_URL,
        {
          emoji: emoji,
          moment_id: momentId,
          intensity: 0,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Reaction sent:", res.data);
      showSuccess(`Đã gửi reaction ${emoji}!`);
    } catch (err) {
      console.error("Failed to send reaction:", err?.response?.data || err);
      showInfo("Phiên đăng nhập đã hết hạn hoặc thiếu token");
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
    showSuccess("Không có dữ liệu local để xoá.");
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
    setShowActivityModal(false); // Đóng activity modal khi close media
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

  // Mở activity modal
  const handleOpenActivityModal = () => {
    if (imageInfo && imageInfo.id) {
      setShowActivityModal(true);
    }
  };

  // Helper function để check user ID match
  const isUserMatch = (postUser, targetUid) => {
    if (!targetUid) return true; // null = "Mọi người"
    if (!postUser) return false;

    // Nếu postUser là string/number
    if (typeof postUser === "string" || typeof postUser === "number") {
      return String(postUser) === String(targetUid);
    }

    // Nếu postUser là object
    if (typeof postUser === "object") {
      return (
        String(postUser.uid) === String(targetUid) ||
        String(postUser.localId) === String(targetUid) ||
        String(postUser.username) === String(targetUid) ||
        String(postUser.id) === String(targetUid)
      );
    }

    return false;
  };

  // Filter posts dựa trên selectedFriendUid
  const displayPosts = useMemo(() => {
    const allPosts = [...serverMoments, ...recentPosts];
    
    if (!selectedFriendUid) {
      // "Mọi người" - hiển thị tất cả
      return allPosts;
    }

    // Filter theo user được chọn
    return allPosts.filter(post => isUserMatch(post.user, selectedFriendUid));
  }, [serverMoments, recentPosts, selectedFriendUid]);

  const resolveUserInfo = useMemo(() => {
    const map = new Map();
    try {
      (friendDetails || []).forEach((f) => {
        const name = `${f.firstName || ""} ${f.lastName || ""}`.trim() || f.username || f.display_name || f.uid || "Người dùng";
        const avatar = f.profilePic || f.avatar || "/prvlocket.png";
        if (f.uid) map.set(String(f.uid), { name, avatar });
        if (f.username) map.set(String(f.username), { name, avatar });
      });
    } catch {}
    // also index current user as fallback
    if (user) {
      const selfName = user.display_name || user.username || user.email || "Bạn";
      const selfAvatar = user.photoURL || user.avatar || "/prvlocket.png";
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

  // Xác định đây có phải bài viết của chính mình không
  const isOwner = useMemo(() => {
    if (!user || !imageInfo?.user) return false;

    // Tập các định danh có thể có ở user hiện tại
    const myIds = [
      user.localId,
      user.uid,
      user.username,
    ].filter(Boolean).map(String);

    const u = imageInfo.user;

    // Server có thể trả user là chuỗi, số, hoặc object
    if (typeof u === "string" || typeof u === "number") {
      return myIds.includes(String(u));
    }
    if (typeof u === "object") {
      return (
        myIds.includes(String(u.uid)) ||
        myIds.includes(String(u.localId)) ||
        myIds.includes(String(u.username)) ||
        myIds.includes(String(u.id))
      );
    }
    return false;
  }, [imageInfo, user]);
  // XÓA ẢNH TRÊN SERVER
  const handleDeleteServerMoment = async (momentId) => {
    if (!momentId) return alert("Không tìm thấy moment để xoá!");

    const token = localStorage.getItem("authToken") || localStorage.getItem("idToken");

    try {
      const res = await axios.post(
        API_URL.DELETE_MOMENT_V2,
        {
          data: {
            moment_uid: momentId,
            delete_globally: true,
            owner_uid: user?.uid,     // user hiện tại
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Delete moment:", res.data);
      showSuccess("Đã xoá ảnh trên server!");

      // Xoá khỏi danh sách serverMoments
      setServerMoments((prev) => prev.filter((m) => m.id !== momentId));

      // Đóng modal
      handleCloseMedia();

    } catch (err) {
      console.error("Delete failed:", err?.response?.data || err);
      alert("Xoá thất bại! Vui lòng thử lại.");
    }
  };

  return (
    <div
      className={`fixed inset-0 flex flex-col transition-all duration-500 z-50 bg-base-100 ${
        isBottomOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col shadow px-4 py-2 text-base-content relative">
        <div className="absolute w-full top-0 z-60">
          <HeaderBeforeCaptureavt/>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-2 pt-4 mt-9">
        <button
          className="btn btn-sm btn-primary"
          onClick={fetchServerMoments}
          disabled={loadingServer}
        >
          {loadingServer ? "Đang tải..." : "Lấy bài viết"}
        </button>
      </div>

      {/* Hiển thị filter hiện tại */}
      {selectedFriendUid && (
        <div className="text-center text-sm text-base-content/70 mb-2 mt-2">
          Đang xem bài viết của: {(() => {
            const friend = friendDetails.find(f => f.uid === selectedFriendUid);
            return friend ? `${friend.firstName} ${friend.lastName}` : 'Người dùng';
          })()}
          <p>Nếu muốn xem thêm thì ấn nút lấy bài viết</p>
        </div>
      )}

      {/* Media grid */}
      <div
        onScroll={(e) => {
          const target = e.target;

          // Khoảng cách từ đáy còn lại (pixels)
          const remainingScroll = target.scrollHeight - target.scrollTop - target.clientHeight;

          // Nếu còn ít hơn 200px => load thêm
          if (remainingScroll < 400 && !loadingServer && hasMore) {
            // Ngăn load liên tục bằng cờ lock nhỏ
            if (!target._loadingTriggered) {
              target._loadingTriggered = true;
              fetchServerMoments(true).finally(() => {
                // reset flag sau 1s để tránh spam khi người dùng cuộn nhanh
                setTimeout(() => {
                  target._loadingTriggered = false;
                }, 1000);
              });
            }
          }
        }}
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
        <div className="fixed inset-0 bg-base-100/90 z-50 overflow-y-auto">
          <div className="flex flex-col items-center p-4 min-h-full">
            <div className="relative w-full max-w-md aspect-square border-4 border-primary rounded-[50px] overflow-hidden overflow-hidden mt-20">
              {selectedVideo ? (
                <video src={selectedVideo} autoPlay loop className="object-cover w-full h-full" />
              ) : (
                <img src={selectedImage} alt="Selected" className="object-cover w-full h-full" />
              )}
              <div className="absolute top-2 left-3 bg-base-300/80 text-base-content px-2 py-1 rounded-full text-xs ml-2">
                {new Date(imageInfo.date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <button
              onClick={handleCloseMedia}
              className="absolute top-2 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-base-300/80 text-base-content hover:bg-base-300 transition"
            >
              ✕
            </button>

            {/* Caption hiển thị */}
            {imageInfo?.captions?.[0] && (
            <div className="absolute left-1/2 bottom-[10px] transform -translate-x-1/2 w-full flex justify-center">
              <div
                className={`flex items-center justify-center text-center px-5 py-3 rounded-3xl font-semibold
                  border border-transparent
                  ${
                    imageInfo?.captions?.[0]?.background?.colors?.length
                      ? ""
                      : "bg-base-300/70 text-base-content backdrop-blur-3xl border-secondary"
                  }`}
                style={{
                  background: imageInfo?.captions?.[0]?.background?.colors?.length
                    ? `linear-gradient(to bottom, ${imageInfo?.captions?.[0]?.background?.colors?.[0]}, ${imageInfo?.captions?.[0]?.background?.colors?.[1]})`
                    : undefined,
                  color: imageInfo?.captions?.[0]?.text_color || undefined,
                  maxWidth: "80vw",         // chỉ giãn tối đa 80% màn hình
                  wordBreak: "break-word",  // xuống dòng nếu quá dài
                  whiteSpace: "pre-wrap",   // giữ format và tự ngắt dòng
                }}
              >
                <div className="flex items-center gap-1">
                  {imageInfo?.captions?.[0]?.icon &&
                    renderOverlayIcon(imageInfo.captions[0].icon)
                  }

                  <span className="text-base leading-snug break-words text-center">
                    {imageInfo?.captions?.[0]?.caption || ""}
                  </span>
                </div>
              </div>
            </div>
          )}





          
          </div>

          

          {imageInfo.user && (() => {
            const info = resolveUserInfo(imageInfo.user);
            return (
              <div className="mt-4 border border-secondary bg-base-300/70 text-base-content px-3 py-1 rounded-full flex items-center gap-2 text-sm mb-40">
                {info.avatar ? (
                  <img src={info.avatar} alt={info.name} className="w-6 h-6 rounded-full border border-base-300 object-cover" />
                ) : (
                  <div className="w-6 h-6 bg-base-200 rounded-full flex items-center justify-center" />
                )}
                <span>{info.name}</span>
              </div>
            );
          })()}

          
          
        
          {/* Reaction or Activity depending on owner */}
        <div className="translate-y-full -mt-50 mb-25 w-full max-w-md">
          {isOwner ? (
            // 👉 Bài viết của mình: hiện "Hoạt động"
            <div
              onClick={handleOpenActivityModal}
              className="flex items-center gap-2 bg-base-300/90 backdrop-blur-sm rounded-full px-3 py-2 border border-base-300 cursor-pointer"
            >
            {/* Activity button - NEW */}
            {imageInfo && imageInfo._origin === "server" && (
              <button
                className="p-1 text-base-content tooltip tooltip-left cursor-pointer "
                onClick={handleOpenActivityModal}
                data-tip="Xem hoạt động bài viết"
              >
                <img 
                  src="/start.png" 
                  alt="activity" 
                  className="w-[30px] h-[30px] object-contain text-primary"
                />
              </button>
            )}
      

          <span className="text-sm font-medium text-base-content">Hoạt động</span>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] ml-[55%]">
            <Activityavt
                momentId={imageInfo?.id}
                friendDetails={friendDetails}
                // user={user}
              />
          </div>
            
        
        </div>
        ) : (
          // 👉 Bài viết của người khác: ô nhập emoji như cũ
          <div className="bg-base-300/90 backdrop-blur-sm rounded-full px-4 py-2 border border-base-300 flex items-center gap-1 -mt-15 mb-30">
            <input
              type="text"
              placeholder="Nhập icon"
              value={reactionInput}
              onChange={(e) => setReactionInput(e.target.value)}
              className="flex-1 bg-transparent text-base-content placeholder:text-base-content/60 outline-none text-sm min-w-0"
            />
            <div className="flex items-center gap-1">
              {quickEmojis.slice(0, 4).map((emoji) => (
                <button
                  key={emoji}
                  onClick={async () => {
                    if (!imageInfo) return;
                    setSelectedEmoji(emoji);
                    setReactionInput(emoji);
                    await sendReaction(imageInfo.id, emoji);
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
            <button
              onClick={handleSendReaction}
              disabled={!selectedEmoji && !reactionInput.trim()}
              className="w-8 h-8 rounded-full bg-primary text-primary-content hover:bg-primary/90 disabled:bg-base-300 disabled:text-base-content disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <Send size={14} />
            </button>
          </div>
        )}
      </div>
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
        {(!selectedImage && !selectedVideo) && (
          <button
            className="p-1 text-base-content rounded-full border-3 border-base-content bg-transparent tooltip tooltip-left cursor-pointer shadow"
            onClick={handleCloseMedia}
            data-tip="Bấm để xoá ảnh"
          >
            <Trash2 size={20} />
          </button>
        )}

          {/* Delete button (chỉ cho ảnh local) */}
          {imageInfo && (
            <button
              className="p-1 text-base-content tooltip-left tooltip cursor-pointer"
              data-tip="Bấm để xoá ảnh"
              onClick={() => {
                if (!imageInfo.id) return alert("Không tìm thấy ảnh!");

                if (imageInfo._origin === "server") {
                  // XÓA ẢNH TRÊN SERVER
                  handleDeleteServerMoment(imageInfo.id);
                } else {
                  // XÓA ẢNH LOCAL
                  handleDeleteImage(imageInfo.id);
                }
              }}
            >
              <Trash2 size={25} />
            </button>
          )}
        </div>
      </div>

      {/* Activity Modal */}
      <ActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        momentId={imageInfo?.id}
        friendDetails={friendDetails}
        user={user}
      />
    </div>
  );
};

export default BottomHomeScreen;