import { Palette, X } from "lucide-react";
import { Link } from "react-router-dom";
import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../../../context/AuthLocket";
import { useApp } from "../../../../context/AppContext";
import CaptionIconSelector from "../CaptionItems/CaptionIconSelector";
import GeneralThemes from "../CaptionItems/GeneralThemes";
import ThemesCustomes from "../CaptionItems/ThemesCustomes";
import DevCustomes from "../CaptionItems/DevCustomes";
import CaptionGifThemes from "../CaptionItems/CaptionGifThemes";

const ScreenCustomeStudio = () => {
  const popupRef = useRef(null);
  const { user, setUser, userPlan } = useContext(AuthContext);
  const { navigation, post, captiontheme } = useApp();

  const { isFilterOpen, setIsFilterOpen } = navigation;
  const {
    selectedColors,
    setSelectedColors,
    caption,
    setCaption,
    postOverlay,
    setPostOverlay,
  } = post;
  const { captionThemes } = captiontheme;

  useEffect(() => {
    if (isFilterOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isFilterOpen]);

  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    if (isFilterOpen) {
      const stored = localStorage.getItem("savedPosts");
      if (stored) {
        try {
          setSavedPosts(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing savedPosts:", e);
        }
      }
    }
  }, [isFilterOpen]);

  const handleCustomeSelect = (
    preset_id,
    icon,
    color_top,
    color_bottom,
    caption,
    text_color,
    type
  ) => {
    // Remove permission check to allow all features
    setPostOverlay({
      overlay_id: preset_id || "standard",
      color_top: color_top || "",
      color_bottom: color_bottom || "",
      text_color: text_color || "#FFFFFF",
      icon: icon || "",
      caption: caption || "",
      type: type || "default",
    });

    // Log để kiểm tra dữ liệu dưới dạng bảng
    console.table([
      {
        overlay_id: preset_id || "standard",
        color_top: color_top || "",
        color_bottom: color_bottom || "",
        text_color: text_color || "#FFFFFF",
        icon: icon || "",
        caption: caption || "",
        type: type || "default",
      },
    ]);

    // Đóng bộ lọc
    setIsFilterOpen(false);
  };

  const handleCustomeSelectTest = (preset) => {
    // Kiểm tra xem preset có đủ thông tin cần thiết không
    if (!preset) return;
    // Nếu là GIF, ép màu nền về #181A20
    const isGif = preset.type === "image_gif";
    // Log để kiểm tra dữ liệu dưới dạng bảng
    console.table([
      {
        overlay_id: preset.preset_id || "standard",
        color_top: isGif ? "#181A20" : preset.color_top || "",
        color_bottom: isGif ? "#181A20" : preset.color_bottom || "",
        text_color: preset.text_color || "#FFFFFF",
        icon: preset.icon || "",
        caption: preset.preset_caption || "",
        type: preset.type || "image_link",
      },
    ]);
    // Cập nhật postOverlay từ giá trị preset
    setPostOverlay({
      overlay_id: preset.preset_id || "standard",
      color_top: isGif ? "#181A20" : preset.color_top || "",
      color_bottom: isGif ? "#181A20" : preset.color_bottom || "",
      text_color: preset.text_color || "#FFFFFF",
      icon: preset.icon || "",
      caption: preset.preset_caption || "",
      type: preset.type || "image_link",
    });
    setIsFilterOpen(false);
  };
  const captionThemesTest = {
    image_icon: [
      {
        id: 1,
        color_top: "#FF5733",
        color_bottom: "#C70039",
        text_color: "#FFF",
        icon: "/path/to/icon1.png",
        preset_caption: "Vibes",
      },
      {
        id: 2,
        color_top: "#3498DB",
        color_bottom: "#2980B9",
        text_color: "#FFF",
        icon: "/path/to/icon2.png",
        preset_caption: "Chill",
      },
    ],
    music_icon: [
      {
        id: 1,
        color_top: "",
        color_bottom: "",
        text_color: "",
        icon: "/path/to/music_icon1.png",
        preset_caption: "Click vào đây đi",
      },
      {
        id: 2,
        color_top: "#3498DB",
        color_bottom: "#2980B9",
        text_color: "#FFF",
        icon: "/path/to/music_icon2.png",
        preset_caption: "Stay",
      },
    ],
  };
  const preset = {
    icon: "/clock-icon.png", // Đổi thành icon của bạn
    preset_caption: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
  const normalizedPresets = savedPosts.map((item) => ({
    id: item.id,
    caption: item.options.caption || "",
    color_top: item.options.color_top || "",
    color_bottom: item.options.color_bottom || "",
    color_text: item.options.color_text || "",
    icon: item.options.icon || "",
    type: item.options.type || "background",
    // Nếu bạn có thêm type, preset_id có thể thêm tương tự
  }));

  return (
    <div
      className={`fixed inset-0 z-90 flex justify-center items-end transition-transform duration-500 ${
        isFilterOpen ? "" : "pointer-events-none"
      }`}
    >
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-base-100/10 backdrop-blur-[2px] bg-opacity-50 transition-opacity duration-500 ${
          isFilterOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setIsFilterOpen(false)}
      ></div>

      {/* Popup */}
      <div
        ref={popupRef}
        className={`w-full h-1/2 bg-base-100 rounded-t-4xl shadow-lg transition-transform duration-500 flex flex-col ${
          isFilterOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header - Ghim cố định */}
        <div className="flex justify-between rounded-t-4xl items-center py-2 px-4 bg-base-100 sticky top-0 left-0 right-0 z-50">
          <div className="flex items-center space-x-2 text-primary">
            <Palette size={22} />
            <div className="text-2xl font-lovehouse mt-1.5 font-semibold">
              Customize studio
            </div>
          </div>
          <button
            onClick={() => setIsFilterOpen(false)}
            className="text-primary cursor-pointer"
          >
            <X size={30} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4">
          <ThemesCustomes
            title="🎨 Your Saved Theme"
            presets={normalizedPresets}
            onSelect={handleCustomeSelect}
          />
          <ThemesCustomes
            title="🎨 Suggest Theme"
            presets={captionThemes.background}
            onSelect={handleCustomeSelect}
          />
          {/* Decorative by Locket */}
          <ThemesCustomes
            title="🎨 Decorative by Locket"
            presets={captionThemes.decorative}
            onSelect={handleCustomeSelect}
          />
          <ThemesCustomes
            title="🎨 New Custome by Wan"
            presets={captionThemes.custome}
            onSelect={handleCustomeSelect}
          />
          <CaptionIconSelector
            title="🎨 Caption Icon - Truy cập sớm"
            captionThemes={captionThemes}
            onSelect={handleCustomeSelectTest}
          />
          <GeneralThemes
            title="🎨 General"
            captionThemes={captionThemes}
            onSelect={handleCustomeSelectTest}
          />
          <CaptionGifThemes
            title="🎨 Caption Gif - Member"
            captionThemes={captionThemes}
            onSelect={handleCustomeSelectTest}
          />
          <div className="">
            <h2 className="text-md font-semibold text-primary mb-2">
              🎨 Caption ? - Sắp ra mắt
            </h2>
            <div className="flex flex-wrap gap-4 pt-2 pb-5 justify-start text-base-content">
              <p>
                Phiên bản sắp tới <strong>V2.0.8</strong>
              </p>
              <p>
                Mọi đóng góp hỗ trợ xin nhận tại{" "}
                <Link
                  to="/aboutme"
                  className="text-primary font-semibold underline hover:text-primary-focus"
                >
                  trang giới thiệu web
                </Link>
              </p>
            </div>
            {/* <div className="flex flex-wrap gap-4 pt-2 pb-5 justify-start">
              {captionThemes.image_icon.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleCustomeSelectTest(preset)}
                  className="flex flex-col whitespace-nowrap items-center space-y-1 py-2 px-4 btn h-auto w-auto rounded-3xl font-semibold justify-center"
                  style={{
                    background: `linear-gradient(to bottom, ${
                      preset.top || preset.color_top
                    }, ${preset.color_bot || preset.color_bottom})`,
                    color: preset.color_text || preset.text_color,
                  }}
                >
                  <span className="text-base flex flex-row items-center">
                    <img src={preset.icon} alt="" className="w-5 h-5 mr-2" />
                    {preset.preset_caption || "Caption"}
                  </span>
                </button>
              ))}
            </div> */}
          </div>

          {/* Music Icon Section */}
          {/* <div>
        <h2 className="text-md font-semibold text-primary mb-2">
          Music Icon Test
        </h2>
        <div className="flex flex-wrap gap-4 pt-2 pb-5 justify-start">
          {captionThemesTest.music_icon.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleCustomeSelectTest(preset)}
              className="flex flex-col whitespace-nowrap items-center space-y-1 py-2 px-4 btn h-auto w-auto rounded-3xl font-semibold justify-center"
              style={{
                background: `linear-gradient(to bottom, ${preset.color_top}, ${preset.color_bottom})`,
                color: preset.text_color,
              }}
            >
              <span className="text-base flex flex-row items-center">
                <img src={preset.icon} alt="" className="w-5 h-5 mr-2" />
                {preset.preset_caption || "Caption"}
              </span>
            </button>
          ))}
        </div>
      </div> */}
        </div>
      </div>
    </div>
  );
};

export default ScreenCustomeStudio;
