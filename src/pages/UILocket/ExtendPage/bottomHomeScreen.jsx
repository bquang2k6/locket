import React, { useContext, useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { AuthContext } from "../../../context/AuthLocket";
import { MessageCircle, Trash2, LayoutGrid } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { showSuccess } from "../../../components/Toast";
import BadgePlan from "./Badge";
import WeatherIcon from "../../../components/UI/WeatherIcon";
import { API_URL } from "../../../utils/API/apiRoutes";
import api from "../../../lib/axios";

const BottomHomeScreen = () => {
  const { user } = useContext(AuthContext);
  const { navigation, post } = useApp();
  const { isBottomOpen, setIsBottomOpen } = navigation;
  const { recentPosts, setRecentPosts } = post;

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedAnimate, setSelectedAnimate] = useState(false);
  const [imageInfo, setImageInfo] = useState(null);
  const [serverMoments, setServerMoments] = useState([]);
  const [loadingServer, setLoadingServer] = useState(false);

  useEffect(() => {
    if (isBottomOpen) {
      // Load cache local
      const localData = JSON.parse(
        localStorage.getItem("uploadedMoments") || "[]"
      ).reverse();
      setRecentPosts(localData);

      // Load cache server (nếu có)
      const cachedServer = JSON.parse(
        localStorage.getItem("serverMoments") || "[]"
      );
      setServerMoments(cachedServer);
    }
  }, [isBottomOpen, setRecentPosts]);

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

      // Lưu cache server
      localStorage.setItem("serverMoments", JSON.stringify(mapped));
      showSuccess("Đã cập nhật bài viết từ server!");
    } catch (e) {
      console.error("Fetch server moments failed", e?.response?.data || e);
      setServerMoments([]);
    } finally {
      setLoadingServer(false);
    }
  };

  const handleClearCache = () => {
    try {
      // Xoá chỉ ảnh local
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
  };

  const handleCloseMedia = () => {
    setSelectedAnimate(false);
    setTimeout(() => {
      setSelectedImage(null);
      setSelectedVideo(null);
      setImageInfo(null);
    }, 500);
  };

  const handleDeleteImage = (id) => {
    const updated = recentPosts.filter((p) => p.id !== id);
    setRecentPosts(updated);
    localStorage.setItem("uploadedMoments", JSON.stringify(updated));
    showSuccess("Xóa ảnh thành công!");
    handleCloseMedia();
  };

  const displayPosts = [...serverMoments, ...recentPosts];

  return (
    <div
      className={`fixed inset-0 flex flex-col transition-all duration-500 z-50 bg-base-100 ${
        isBottomOpen
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-full opacity-0 scale-0"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col shadow-lg px-4 py-2 text-base-content relative overflow-hidden">
        <div className="flex items-center justify-between">
          <BadgePlan />
          <div className="flex items-center gap-2">
            <button className="rounded-full p-2 bg-base-200 relative">
              <MessageCircle size={30} />
            </button>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-2 pt-4">
        <button
          className="btn btn-sm btn-primary"
          onClick={fetchServerMoments}
          disabled={loadingServer}
        >
          {loadingServer ? "Đang tải..." : "Lấy bài viết"}
        </button>
        {/* <button
          className="btn btn-sm btn-ghost"
          onClick={handleClearCache}
          title="Xoá ảnh local"
        >
          Xoá cache
        </button> */}
      </div>

      {/* Grid media */}
      <div
        className={`flex flex-wrap overflow-y-auto p-2 transition-all duration-0 h-150 ${
          selectedAnimate ? "opacity-0 scale-0" : "opacity-100 scale-100"
        }`}
      >
        {loadingServer && (
          <div className="w-full text-center py-4 text-base-content/70">
            Đang tải lịch sử...
          </div>
        )}
        {!loadingServer && displayPosts.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
            <div className="text-lg text-base-content/70 font-semibold">
              Chưa có ảnh nào được đăng, hãy đăng ảnh để xem nhé!
            </div>
          </div>
        ) : (
          displayPosts.map((item, index) => (
            <div
              key={`bottom-post-${item._origin || "mix"}-${item.id}-${index}`}
              className="w-1/3 md:w-1/6 aspect-square overflow-hidden p-1 cursor-pointer"
              onClick={() => handleOpenMedia(item)}
            >
              {item.video_url ? (
                <video
                  src={item.video_url}
                  className={`object-cover w-full h-full rounded-3xl transition-all duration-300 transform ${
                    selectedVideo === item.video_url ? "scale-110" : "scale-95"
                  }`}
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={item.thumbnail_url || item.image_url}
                  alt={item.captions?.[0]?.text || "Image"}
                  className={`object-cover w-full h-full rounded-3xl transition-all duration-300 transform ${
                    selectedImage === (item.image_url || item.thumbnail_url)
                      ? "scale-110"
                      : "scale-95"
                  }`}
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal media lớn + caption */}
      <div
        className={`absolute inset-0 flex justify-center items-center transition-all duration-500 ${
          selectedAnimate ? "opacity-100 scale-100" : "opacity-0 scale-0"
        }`}
      >
        <div className="relative max-w-md aspect-square">
          {selectedVideo ? (
            <video
              src={selectedVideo}
              autoPlay
              className="object-contain border-0 rounded-[65px]"
            />
          ) : (
            selectedImage && (
              <img
                src={selectedImage}
                alt="Selected"
                className="object-contain border-0 rounded-[65px]"
              />
            )
          )}
          {imageInfo && imageInfo.captions && imageInfo.captions.length > 0 && (
            <div className="mt-4 absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4">
              <div
                className={`flex flex-col whitespace-nowrap drop-shadow-lg items-center space-y-1 py-2 px-4 h-auto w-auto rounded-3xl font-semibold justify-center ${
                  !imageInfo.captions[0].background?.colors.length
                    ? "bg-black/70 text-white backdrop-blur-3xl"
                    : ""
                }`}
                style={{
                  background: imageInfo.captions[0].background?.colors.length
                    ? `linear-gradient(to bottom, ${
                        imageInfo.captions[0].background.colors[0] ||
                        "transparent"
                      }, ${
                        imageInfo.captions[0].background.colors[1] ||
                        "transparent"
                      })`
                    : undefined,
                  color:
                    imageInfo.captions[0].text_color ||
                    (!imageInfo.captions[0].background?.colors.length
                      ? "white"
                      : ""),
                }}
              >
                {imageInfo.captions[0].icon?.type === "image" ? (
                  <img
                    src={imageInfo.captions[0].icon.data}
                    alt="Icon"
                    className="w-6 h-6 object-cover"
                  />
                ) : imageInfo.captions[0].type === "weather" &&
                  imageInfo.captions[0].icon ? (
                  <WeatherIcon
                    weatherCode={imageInfo.captions[0].icon}
                    className="w-6 h-6"
                  />
                ) : imageInfo.captions[0].icon ? (
                  <span>{imageInfo.captions[0].icon}</span>
                ) : null}
                <span>{imageInfo.captions[0].caption}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Button */}
      <div className="flex flex-col shadow-lg px-4 py-2 text-base-content overflow-hidden bottom-0 fixed w-full">
        <div className="flex items-center justify-between">
          {/* Close button */}
          <button
            className="p-1 text-base-content tooltip tooltip-right cursor-pointer"
            onClick={handleCloseMedia}
            data-tip="Bấm để xem danh sách lưới"
          >
            <LayoutGrid size={30} />
          </button>
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
          <button
            className="p-2 rounded-full border-3 border-white bg-transparent text-white tooltip tooltip-left cursor-pointer shadow"
            onClick={handleCloseMedia}
            data-tip="Chức năng đang phát triển"
          >
            <MoreHorizontal size={18} />
          </button>

          {/* Delete button (chỉ áp dụng cho ảnh local) */}
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
