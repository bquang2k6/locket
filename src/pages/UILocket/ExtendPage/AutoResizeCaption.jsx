import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../../../context/AppContext";
import { PiClockFill } from "react-icons/pi";
import { StarRating } from "../../../components/UI/StarRating/StarRating";
import WeatherIcon from "../../../components/UI/WeatherIcon";

const AutoResizeCaption = () => {
  const textareaRef = useRef(null);
  const imageIconRef = useRef(null);
  const parentRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));
  const { post } = useApp();
  const { postOverlay, setPostOverlay } = post;

  // Hàm để tính toán màu chữ tương phản với màu nền
  const getContrastTextColor = (backgroundColor) => {
    if (!backgroundColor) return '#FFFFFF';
    
    // Chuyển đổi hex sang RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Tính độ sáng
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Trả về màu trắng nếu nền tối, đen nếu nền sáng
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  // Lấy màu chữ phù hợp
  const getTextColor = () => {
    if (postOverlay.text_color) return postOverlay.text_color;
    
    // Tự động tính toán màu chữ dựa trên màu nền
    const bgColor = postOverlay.color_top || '#000000';
    return getContrastTextColor(bgColor);
  };

  const placeholder = "Nhập tin nhắn...";
  const defaultImageIconWidth = 200; // Thêm width mặc định cho image_icon
  const [width, setWidth] = useState(defaultImageIconWidth);
  const [shouldWrap, setShouldWrap] = useState(false);

  const adjustHeight = (ref) => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  };

  const getTextWidth = (text, ref) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context || !ref.current) return 100;

    const style = getComputedStyle(ref.current);
    context.font = `${style.fontSize} ${style.fontFamily}`;

    const emojiRegex =
      /([\uD800-\uDBFF][\uDC00-\uDFFF])|(\p{Extended_Pictographic})/gu;
    const textOnly = text.replace(emojiRegex, "");
    const emojiMatches = text.match(emojiRegex) || [];

    const baseWidth = context.measureText(textOnly).width;
    const emojiWidth = emojiMatches.length * 24;

    return baseWidth + emojiWidth;
  };

  useEffect(() => {
    adjustHeight(textareaRef);
    adjustHeight(imageIconRef);

    let combinedText;
    if (postOverlay.type === "weather") {
      // Cho weather type, chỉ sử dụng caption
      combinedText = postOverlay.caption || placeholder;
    } else if (postOverlay.type === "image_icon") {
      combinedText = postOverlay.caption || placeholder;
    } else {
      // Cho các type khác, kết hợp icon + caption
      combinedText = `${postOverlay.icon || ""} ${
        postOverlay.caption || placeholder
      }`.trim();
    }

    const baseWidth = getTextWidth(
      combinedText,
      postOverlay.type === "image_icon" ? imageIconRef : textareaRef
    );
    const padding = 32;
    const finalWidth = baseWidth + padding;

    let maxAllowedWidth = window.innerWidth * 0.9;
    if (parentRef.current) {
      maxAllowedWidth = parentRef.current.clientWidth;
    }

    const adjustedWidth =
      finalWidth > maxAllowedWidth ? maxAllowedWidth : finalWidth;

    setWidth(
      postOverlay.type === "image_icon" && finalWidth < defaultImageIconWidth
        ? defaultImageIconWidth
        : adjustedWidth
    );
    setShouldWrap(finalWidth > maxAllowedWidth);
  }, [postOverlay.icon, postOverlay.caption, postOverlay.type, placeholder]);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    if (postOverlay.type === "weather") {
      // Cho weather type, chỉ cập nhật caption
      setPostOverlay((prev) => ({
        ...prev,
        caption: inputValue,
      }));
    } else {
      // Cho các type khác, xử lý icon + caption
      const icon = postOverlay.icon || "";
      const prefix = icon ? `${icon} ` : "";

      if (inputValue.startsWith(prefix)) {
        const newCaption = inputValue.slice(prefix.length);
        setPostOverlay((prev) => ({
          ...prev,
          caption: newCaption,
        }));
      } else {
        setPostOverlay((prev) => ({
          ...prev,
          caption: inputValue,
        }));
      }
    }
  };

  const isEditable = !["decorative", "custome"].includes(postOverlay?.type);

  // Tạo formattedTime cho time type
  const formattedTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div ref={parentRef} className="relative w-full">
      {postOverlay.type === "image_icon" ? (
        <div
          className="flex items-center backdrop-blur-2xl gap-2 py-2 px-4 rounded-4xl absolute bottom-2 left-1/2 transform -translate-x-1/2"
          style={{
            width: `${width}px`,
            background: `linear-gradient(to bottom, ${postOverlay.color_top || '#000000'}, ${postOverlay.color_bottom || '#000000'})`,
          }}
        >
          <img
            src={postOverlay.icon}
            alt="Icon"
            className="w-6 h-6 object-cover"
          />
          <textarea
            ref={imageIconRef}
            value={postOverlay.caption || ""}
            onChange={(e) =>
              setPostOverlay((prev) => ({
                ...prev,
                caption: e.target.value,
              }))
            }
            placeholder={placeholder}
            rows={1}
            className="font-semibold outline-none w-auto resize-none overflow-hidden transition-all"
            style={{
              width: `${width}px`,
              color: getTextColor(),
              whiteSpace: shouldWrap ? "pre-wrap" : "nowrap",
            }}
          />
        </div>
      ) : postOverlay.type === "image_gif" ? (
        <div
          className="flex items-center backdrop-blur-2xl gap-2 py-2 px-4 rounded-4xl absolute bottom-2 left-1/2 transform -translate-x-1/2"
          style={{
            width: `${width}px`,
            background: `linear-gradient(to bottom, ${postOverlay.color_top || '#181A20'}, ${postOverlay.color_bottom || postOverlay.color_top || '#181A20'})`,
          }}
        >
          <img
            src={postOverlay.icon}
            alt="GIF"
            className="w-8 h-8 object-contain rounded-lg"
            style={{ maxHeight: 32, maxWidth: 32 }}
          />
          <span
            className="font-semibold ml-2 truncate"
            style={{
              color: postOverlay.text_color || '#fff',
              whiteSpace: shouldWrap ? "pre-wrap" : "nowrap",
              background: 'transparent',
              maxWidth: `${width - 40}px`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {postOverlay.caption || ""}
          </span>
        </div>
      ) : postOverlay.type === "time" ? (
        <div 
          className="flex items-center backdrop-blur-2xl gap-1 py-2 px-4 rounded-4xl absolute bottom-2 left-1/2 transform -translate-x-1/2 font-semibold"
          style={{
            background: `linear-gradient(to bottom, ${postOverlay.color_top || '#000000'}, ${postOverlay.color_bottom || '#000000'})`,
            color: getTextColor(),
          }}
        >
          <PiClockFill className="w-6 h-6 rotate-270" />
          <span>{postOverlay.caption || formattedTime}</span>
        </div>
      ) : postOverlay.type === "weather" ? (
        <div 
          className="flex items-center backdrop-blur-2xl gap-2 py-2 px-4 rounded-4xl absolute bottom-2 left-1/2 transform -translate-x-1/2 font-semibold"
          style={{
            background: `linear-gradient(to bottom, ${postOverlay.color_top || '#000000'}, ${postOverlay.color_bottom || '#000000'})`,
            color: getTextColor(),
          }}
        >
          <WeatherIcon weatherCode={postOverlay.icon || "01d"} className="w-6 h-6" />
          <span>{postOverlay.caption || "25°C trời đẹp"}</span>
        </div>
      ) : postOverlay.type === "review" ? (
        <div
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2
             backdrop-blur-2xl rounded-4xl
             px-6 pt-2 flex flex-col items-center font-semibold
             max-w-[90vw] w-max"
          style={{
            background: `linear-gradient(to bottom, ${postOverlay.color_top || '#000000'}, ${postOverlay.color_bottom || '#000000'})`,
          }}
        >
          {/* Hàng trên: 5 sao */}
          <div className="flex gap-2 mb-1">
            <StarRating rating={postOverlay.icon || 0} />
          </div>

          {/* Hàng dưới: text với dấu ngoặc kép ở 2 góc trên */}
          <div className="relative text-center text-sm leading-tight max-w-full px-4">
            {/* Dấu " trái */}
            <span
              className="absolute -top-2 left-0 text-xl select-none"
              aria-hidden="true"
            >
              &ldquo;
            </span>

            {/* Dấu " phải */}
            <span
              className="absolute -top-2 right-0 text-xl select-none"
              aria-hidden="true"
            >
              &rdquo;
            </span>

            {/* Text chính */}
            <span 
              className="inline-block text-lg font-semibold max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
              style={{ color: getTextColor() }}
            >
              {postOverlay.caption}
            </span>
          </div>
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={
            postOverlay.type === "weather" 
              ? postOverlay.caption || "25°C trời đẹp"
              : postOverlay.icon
                ? `${postOverlay.icon} ${postOverlay.caption || ""}`.trim()
                : postOverlay.caption || ""
          }
          onChange={handleChange}
          placeholder={placeholder}
          rows={1}
          className="absolute z-10 px-4 font-semibold bottom-2 left-1/2 transform backdrop-blur-2xl -translate-x-1/2 rounded-4xl py-2 text-md outline-none max-w-[90%] resize-none overflow-hidden transition-all"
          style={{
            width: `${width}px`,
            color: getTextColor(),
            whiteSpace: shouldWrap ? "pre-wrap" : "nowrap",
            background: `linear-gradient(to bottom, ${postOverlay.color_top || '#000000'}, ${postOverlay.color_bottom || '#000000'})`,
          }}
          disabled={!isEditable}
          wrap={shouldWrap ? "soft" : "off"}
        />
      )}
    </div>
  );
};

export default AutoResizeCaption;
