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
import gifCacheDB from '../../../../helpers/gifCacheDB';

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
  const [showGifModal, setShowGifModal] = useState(false);
  const [selectedGif, setSelectedGif] = useState(null);
  const [bgColor, setBgColor] = useState("#181A20");
  const [colorBottom, setColorBottom] = useState("#181A20");
  const [captionText, setCaptionText] = useState("");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [mainPreview, setMainPreview] = useState(null);
  const [gifError, setGifError] = useState("");
  const [gifSrcMap, setGifSrcMap] = useState({}); // url -> objectURL
  const [isCachingGifs, setIsCachingGifs] = useState(false);

  // Danh sách GIF từ Firebase, thêm GIF mới vào mảng này
  const gifList = [
    "https://firebasestorage.googleapis.com/v0/b/webdio-20ca8.appspot.com/o/locket-dio-gif%2FHappy-Blue-Sky.gif?alt=media&token=c20323 6c-5442-4212-9b8b-f0ff15ac996e",
    "https://firebasestorage.googleapis.com/v0/b/webdio-20ca8.appspot.com/o/locket-dio-gif%2FDog-What.gif?alt=media&token=6b48e292-8d2d-45a2-9a44-8926c102837f",
    "https://firebasestorage.googleapis.com/v0/b/webdio-20ca8.appspot.com/o/locket-dio-gif%2Fdeath.gif?alt=media&token=befd70fc-5d90-4575-8bd2-f88fd821ab1f",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/2c68009a28d042cd83ae9d9de5587e65.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/48eb4cfdf6bf47eea76d4309a8b301fd.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/8160a7d8756b4952ac99bf91afade11f.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/822ccb5a7c124e1c97941803ad38c91e.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/9168d7c5c4b94e02a2cbc768bacdd199.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/93bd734619674dbbad4d64e9e22dcee6.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/9a2a09c7076942a28f8a6aa9e3672d59.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/9d9477096c204373ad3573c816694b23.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/a5eea28dd6c14a1d966a27e5561e99c8.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/b37d4c66ece243d0aeba598c24231612.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/c10d5f2da9584bf09ada65dc3a31264b.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/c7b55f1ac283483092fcaab25dc98515.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/caa0183826944deda599270edcc527c1.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/dap.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/deadline.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/f9ac1fe6c380428b8a5659b8c5c659d6.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/f9cfedb38a12461b875fff41a60912c8.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/fcf3d9f2f85f4ed2bcf6f66def68071f.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/haha.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/nhang.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/output_no_bg_square.gif"
    
    // Thêm các GIF mới tại đây
  ];

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

  // Cache toàn bộ GIF vào IndexedDB khi mở modal lần đầu
  useEffect(() => {
    if (showGifModal && !isCachingGifs) {
      setIsCachingGifs(true);
      (async () => {
        const newGifSrcMap = {};
        for (const url of gifList) {
          try {
            let blob = await gifCacheDB.getGif(url);
            if (!blob) {
              const res = await fetch(url);
              blob = await res.blob();
              await gifCacheDB.setGif(url, blob);
            }
            const objectUrl = URL.createObjectURL(blob);
            newGifSrcMap[url] = objectUrl;
          } catch (e) {
            // Nếu lỗi, fallback về url gốc
            newGifSrcMap[url] = url;
          }
        }
        setGifSrcMap(newGifSrcMap);
        setIsCachingGifs(false);
      })();
    }
    // Cleanup object URLs khi đóng modal
    if (!showGifModal) {
      Object.values(gifSrcMap).forEach(src => {
        if (src && src.startsWith('blob:')) URL.revokeObjectURL(src);
      });
      setGifSrcMap({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGifModal]);

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
            extraButton={
              <button
                className="flex flex-col whitespace-nowrap items-center space-y-1 py-2 px-4 btn btn-primary h-auto w-auto rounded-3xl font-semibold justify-center"
                onClick={() => setShowGifModal(true)}
                aria-label="Add GIF Caption"
              >
                <span className="text-base flex flex-row items-center">
                  <span className="w-5 h-5 mr-2 flex items-center justify-center">+</span>
                  Caption
                </span>
              </button>
            }
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
        {/* Modal chọn GIF và preview */}
        {showGifModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl p-6 w-full max-w-md relative max-h-[100vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-primary"
                onClick={() => setShowGifModal(false)}
                aria-label="Đóng"
              >
                <X size={28} />
              </button>
              <h2 className="text-xl font-bold mb-4 text-primary">Chọn GIF</h2>
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Thư viện GIF</h3>
                <div className="grid grid-cols-5 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-lg bg-gray-50">
                  {gifList.map((gif, idx) => (
                    <img
                      key={idx}
                      src={gifSrcMap[gif] || gif}
                      alt={`GIF ${idx}`}
                      className={`w-[50px] h-[50px] object-cover rounded-sm cursor-pointer border transition-all hover:scale-105 ${
                        selectedGif === gif 
                        ? " border-2 border-primary shadow-sm scale-130" 
                        : "border-gray-200 hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedGif(gif)}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-4 mb-4">
                <h3 className="text-sm font-medium">Tùy chỉnh</h3>
                <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
                  <div className="mb-2">
                    <label className="block mb-1 text-sm">Màu nền trên:</label>
                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1 text-sm">Màu nền dưới:</label>
                    <input type="color" value={colorBottom} onChange={e => setColorBottom(e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1 text-sm">Caption:</label>
                    <input 
                      type="text" 
                      value={captionText} 
                      onChange={e => setCaptionText(e.target.value)} 
                      className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary" 
                      placeholder="Nhập caption..."
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1 text-sm">Màu chữ:</label>
                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-8 rounded cursor-pointer" />
                  </div>
                </div>
              </div>
              {/* Preview + Nút tích */}
              {gifError && (
                <span className="text-red-500 text-sm mb-5 block text-right w-full" style={{textAlign: "center"}}>{gifError}</span>
              )}
              <div className="flex flex-row items-center justify-center gap-2 mb-4 w-full">
                <div className="relative w-40 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0" style={{ background: `linear-gradient(to bottom, ${bgColor}, ${colorBottom})`, borderRadius: '100px', marginBottom: '200px' }}>
                  {selectedGif && (
                    <img src={selectedGif} alt="Preview GIF" className="absolute inset-0 w-7 h-7 object-cover" style={{marginLeft: '13px', marginTop: '9px'}}/>
                  )}
                  <span
                    className="absolute bottom-1 left-1/2 transform -translate-x-1/2 px-1 py-0.5 rounded text-base font-bold"
                    style={{ color: textColor, background: "rgba(0,0,0,0.3)" }}
                  >
                    {captionText}
                  </span>
                </div>
                
                <button
                  className="btn btn-success btn-circle flex items-center justify-center ml-2 flex-shrink-0"
                  style={{ width: 40, height: 40, minWidth: 40, marginBottom: '200px' }}
                  title="Chọn GIF này"
                  onClick={() => {
                    if (!selectedGif) {
                      setGifError("Vui lòng chọn một GIF trước khi tiếp tục.");
                      return;
                    }
                    setPostOverlay({
                      type: "image_gif",
                      icon: selectedGif,
                      caption: captionText,
                      color_top: bgColor,
                      color_bottom: colorBottom,
                      text_color: textColor,
                    });
                    setShowGifModal(false);
                    setGifError("");
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
              
            </div>
          </div>
        )}
        {/* Preview chính sau khi chọn xong */}
        {mainPreview && (
          <div className="flex flex-col items-center mt-4">
            <div className="relative w-40 h-40 rounded-lg overflow-hidden" style={{ background: mainPreview.bgColor }}>
              {mainPreview.gif && (
                <img src={mainPreview.gif} alt="GIF Preview" className="absolute inset-0 w-full h-full object-cover" />
              )}
              <span
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-lg font-bold"
                style={{ color: mainPreview.textColor, background: "rgba(0,0,0,0.3)" }}
              >
                {mainPreview.captionText}
              </span>
            </div>
            <span className="mt-2 text-primary font-semibold">Preview</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenCustomeStudio;
