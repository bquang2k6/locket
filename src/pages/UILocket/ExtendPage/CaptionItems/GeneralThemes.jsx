import React, { useEffect, useState } from "react";
import { PiClockFill } from "react-icons/pi";
import { FaBatteryFull } from "react-icons/fa";
import { useApp } from "../../../../context/AppContext";
import { Star } from "lucide-react";
import { StarProgress } from "../../../../components/UI/StarRating/StarProgress";
// import { API_URL, useBatteryStatus } from "../../../../utils";
import { useLocationOptions } from "../../../../utils/enviroment";
import { useLocationWeather } from "../../../../utils/enviroment/weather";
import WeatherIcon from "../../../../components/UI/WeatherIcon";
// import axios from "axios";

export default function GeneralThemes({ title }) {
  const { navigation, post, captiontheme } = useApp();
  const { isFilterOpen, setIsFilterOpen } = navigation;
  const { postOverlay, setPostOverlay } = post;
  const { addressOptions } = useLocationOptions();
  const { captionThemes } = captiontheme;
  const { weather, loading: weatherLoading, error: weatherError } = useLocationWeather();

  const [time, setTime] = useState(() => new Date());
  // const { level, charging } = useBatteryStatus();

  const [showSpotifyForm, setShowSpotifyForm] = useState(false);
  const [spotifyLink, setSpotifyLink] = useState("");

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0); // mặc định 5 sao
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");

  const [savedAddressOptions, setSavedAddressOptions] = useState([]);

  // Weather custom form
  const [showWeatherForm, setShowWeatherForm] = useState(false);
  const [selectedWeatherIcon, setSelectedWeatherIcon] = useState("01d");
  const [customTemperature, setCustomTemperature] = useState(25);
  const [customWeatherDesc, setCustomWeatherDesc] = useState("trời đẹp");

  const weatherIcons = [
    { code: "01d", name: "Nắng", desc: "trời quang" },
    { code: "02d", name: "Ít mây", desc: "ít mây" },
    { code: "03d", name: "Nhiều mây", desc: "nhiều mây" },
    { code: "04d", name: "Mây dày", desc: "mây dày" },
    { code: "09d", name: "Mưa nhẹ", desc: "mưa nhẹ" },
    { code: "10d", name: "Mưa", desc: "mưa" },
    { code: "11d", name: "Sấm sét", desc: "sấm sét" },
    { code: "13d", name: "Tuyết", desc: "tuyết" },
    { code: "50d", name: "Sương mù", desc: "sương mù" },
  ];

  const weatherDescriptions = [
    "trời đẹp", "trời quang", "ít mây", "nhiều mây", "mây dày",
    "mưa nhẹ", "mưa", "mưa to", "sấm sét", "tuyết", "sương mù",
    "trời lạnh", "trời nóng", "trời mát", "trời ẩm"
  ];

  useEffect(() => {
    if (addressOptions.length > 0) {
      setSavedAddressOptions(addressOptions);
    }
  }, [addressOptions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleCustomeSelect = ({
    preset_id = "standard",
    icon = "",
    color_top = "",
    color_bottom = "",
    caption = "",
    text_color = "#FFFFFF",
    type = "default",
  }) => {
    setPostOverlay({
      overlay_id: preset_id,
      color_top,
      color_bottom,
      text_color,
      icon,
      caption,
      type,
    });

    console.table([
      {
        overlay_id: preset_id,
        color_top,
        color_bottom,
        text_color,
        icon,
        caption,
        type,
      },
    ]);

    setIsFilterOpen(false);
  };

  const handleSpotifySubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Bật loading trước khi gọi API
    try {
      const res = await api.post(`${API_URL.SPOTIFY_URL}`, {
        spotifyUrl: spotifyLink,
      });
      setPostOverlay({
        overlay_id: "music",
        color_top: "",
        color_bottom: "",
        text_color: "",
        icon: "",
        caption: `${res.data.data.title} - ${res.data.data.artist}`,
        type: "music",
        music: res.data.data, // <- Lưu object ở key khác
      });
      showSuccess(res?.data?.message);
      setShowSpotifyForm(false);
      setSpotifyLink("");
      setIsFilterOpen(false);
    } catch (err) {
      showError("Không thể lấy thông tin bài hát");
    } finally {
      setLoading(false); // Tắt loading sau khi xong
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    handleCustomeSelect({
      preset_id: "review",
      icon: reviewRating,
      caption: reviewText,
      type: "review",
    });

    setShowReviewForm(false);
    setReviewText("");
  };

  const handleWeatherSubmit = (e) => {
    e.preventDefault();
    
    // Tạo payload theo format thực tế của hệ thống
    const weatherPayload = {
      options: {
        caption: {
          temp_c: customTemperature,
          temp_c_rounded: Math.round(customTemperature),
          condition: customWeatherDesc,
          icon: `//cdn.weatherapi.com/weather/64x64/day/${selectedWeatherIcon}.png`,
          temperature: (customTemperature * 9/5) + 32, // Convert to Fahrenheit
          cloud_cover: 0.5, // Default value
          is_daylight: true, // Default to day
          wk_condition: getWeatherCondition(selectedWeatherIcon)
        },
        overlay_id: "weather",
        type: "weather",
        icon: "",
        text_color: "#FFFFFF",
        color_top: "",
        color_bottom: "",
        audience: "all",
        recipients: [],
        music: ""
      }
    };

    // Gọi handleCustomeSelect với payload đúng format
    handleCustomeSelect(weatherPayload);

    // Reset form
    setShowWeatherForm(false);
    setCustomTemperature(25);
    setCustomWeatherDesc("trời đẹp");
    setSelectedWeatherIcon("01d");
  };

  // Function xử lý khi sử dụng thời tiết thực
  const handleUseRealWeather = () => {
    if (!weather) return;
    
    // Tạo payload theo format thực tế với dữ liệu thời tiết thực
    const realWeatherPayload = {
      options: {
        caption: {
          temp_c: weather.temp,
          temp_c_rounded: Math.round(weather.temp),
          condition: weather.desc,
          icon: `//cdn.weatherapi.com/weather/64x64/day/${weather.icon}.png`,
          temperature: (weather.temp * 9/5) + 32, // Convert to Fahrenheit
          cloud_cover: weather.humidity ? weather.humidity / 100 : 0.5,
          is_daylight: true, // Có thể detect từ thời gian
          wk_condition: getWeatherCondition(weather.icon)
        },
        overlay_id: "weather",
        type: "weather",
        icon: "",
        text_color: "#FFFFFF",
        color_top: "",
        color_bottom: "",
        audience: "all",
        recipients: [],
        music: ""
      }
    };

    // Gọi handleCustomeSelect với payload đúng format
    handleCustomeSelect(realWeatherPayload);
    
    // Đóng modal
    setShowWeatherForm(false);
  };

  // Helper function để convert weather code thành condition
  const getWeatherCondition = (weatherCode) => {
    const conditionMap = {
      '01d': 'clear',
      '01n': 'clear',
      '02d': 'partlyCloudy',
      '02n': 'partlyCloudy',
      '03d': 'cloudy',
      '03n': 'cloudy',
      '04d': 'cloudy',
      '04n': 'cloudy',
      '09d': 'rainy',
      '09n': 'rainy',
      '10d': 'rainy',
      '10n': 'rainy',
      '11d': 'stormy',
      '11n': 'stormy',
      '13d': 'snowy',
      '13n': 'snowy',
      '50d': 'foggy',
      '50n': 'foggy'
    };
    return conditionMap[weatherCode] || 'clear';
  };

  const [error, setError] = React.useState("");

  const isValidSpotifyTrackUrl = (url) => {
    const regex = /^https:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+(\?.*)?$/;
    return regex.test(url.trim());
  };
  const handleClick = (id) => {
    switch (id) {
      case "music":
        setShowSpotifyForm(true);
        break;
      case "review":
        setShowReviewForm(true);
        break;
      case "time":
        handleCustomeSelect({
          preset_id: "image_icon",
          caption: formattedTime,
          type: "time",
        });
        break;
      case "location":
        break;
      case "weather":
        // Luôn hiển thị modal tùy chỉnh thời tiết
        setShowWeatherForm(true);
        break;
      case "battery":
        // handleCustomeSelect({
        //   preset_id: "battery",
        //   caption: level || "50",
        //   icon: charging,
        //   type: "battery",
        // });
        break;
      case "heart":
        // handleCustomeSelect({
        //   preset_id: "heart",
        //   caption: "inlove",
        //   type: "heart",
        // });
        // break;
      default:
        break;
    }
  };

  const buttons = [
    {
      id: "music",
      icon: (
        <img src="./images/music_icon_Normal@3x.png" className="w-6 h-6 mr-2" />
      ),
      label: "Đang phát",
    },
    {
      id: "review",
      icon: <img src="./images/star.png" className="w-5 h-5 mr-2" />,
      label: "Review",
    },
    {
      id: "time",
      icon: <PiClockFill className="w-6 h-6 mr-2 rotate-270" />,
      label: formattedTime,
    },
    {
      id: "weather",
      icon: weatherLoading ? (
        <img
          src="./images/sun_max_indicator_Normal@3x.png"
          className="w-6 h-6 mr-1 animate-pulse"
        />
      ) : weatherError ? (
        <img
          src="./images/sun_max_indicator_Normal@3x.png"
          className="w-6 h-6 mr-1"
        />
      ) : weather ? (
        <WeatherIcon weatherCode={weather.icon} className="w-6 h-6 mr-1" />
      ) : (
        <img
          src="./images/sun_max_indicator_Normal@3x.png"
          className="w-6 h-6 mr-1"
        />
      ),
      label: weatherLoading 
        ? "Đang tải..." 
        : weatherError 
          ? "Tùy chỉnh" 
          : weather 
            ? `${weather.temp}°C` 
            : "Tùy chỉnh",
      disabled: weatherLoading,
      className: weatherLoading ? 'opacity-50 cursor-not-allowed' : weatherError ? 'border-orange-300' : ''
    },
    // {
    //   id: "battery",
    //   icon: (
    //     <img
    //       src="https://img.icons8.com/?size=100&id=WDlpopZDVw4P&format=png&color=000000"
    //       className="w-6 h-6 mr-1"
    //     />
    //   ),
    //   label: `50%`,
    // },
    // {
    //   id: "heart",
    //   icon: <img src="./images/heart_icon_red.svg" className="w-6 h-6 mr-1" />,
    //   label: "inlove",
    // },
    {
      id: "location",
      icon: (
        <img
          src="https://img.icons8.com/?size=100&id=NEiCAz3KRY7l&format=png&color=000000"
          className="w-6 h-6 mr-1"
        />
      ),
      label: addressOptions[0] || "Vị trí",
    },
  ];

  return (
    <div>
      {title && (
        <>
          <div className="flex flex-row gap-3 items-center mb-2">
            <h2 className="text-md font-semibold text-primary">{title}</h2>
            <div className="badge badge-sm badge-secondary">New</div>
          </div>
        </>
      )}
      <div className="flex flex-wrap gap-4 pt-2 pb-5 justify-start">
        {buttons.map(({ id, icon, label, disabled, className }) => (
          <button
            key={id}
            onClick={() => handleClick(id)}
            disabled={disabled}
            className={`flex flex-col whitespace-nowrap bg-base-200 dark:bg-white/30 backdrop-blur-3xl items-center space-y-1 py-2 px-4 btn h-auto w-auto rounded-3xl font-semibold justify-center ${className || ''}`}
          >
            <span className="text-base flex flex-row items-center gap-1">
              {icon}
              {id === "location" ? (
                <div className="relative w-max">
                  {/* Hiển thị label tùy chỉnh */}
                  <div className="cursor-pointer select-none">
                    {savedAddressOptions[0] || "Vị trí"}
                  </div>

                  {/* Select vô hình, nhưng phủ lên toàn bộ div */}
                  <select
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) =>
                      handleCustomeSelect({
                        preset_id: "location",
                        caption: e.target.value,
                        icon: "",
                        type: "location",
                      })
                    }
                  >
                    <option value="" disabled>
                      Chọn địa chỉ...
                    </option>
                    {savedAddressOptions.map((opt, idx) => (
                      <option key={idx} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                label
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Popup Spotify */}
      <div
        className={`
    fixed inset-0 bg-black/50 backdrop-blur-sm
    flex justify-center items-center z-[9999] transition-all duration-300
    ${
      showSpotifyForm
        ? "opacity-100 pointer-events-auto"
        : "opacity-0 pointer-events-none"
    }
  `}
        onClick={() => setShowSpotifyForm(false)}
      >
        <form
          onSubmit={handleSpotifySubmit}
          className={`bg-base-200 border-2 border-dashed p-6 rounded-3xl max-w-md w-full mx-3 relative shadow-2xl
            transform transition-all duration-300 ease-out
            ${
              showSpotifyForm
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4 pointer-events-none"
            }
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Nút đóng */}
          <button
            type="button"
            onClick={() => setShowSpotifyForm(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-base-300 hover:bg-base-400 flex items-center justify-center transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <label className="text-base-content font-semibold block pr-8">
            Nhập link Spotify:
          </label>
          <p className="text-xs">Caption nhạc chỉ hiển thị trên IOS</p>
          <p className="text-xs mb-2">
            Android vẫn đăng và hiển thị nhưng chỉ IOS thấy
          </p>

          <input
            type="text"
            value={spotifyLink}
            onChange={(e) => {
              const trimmed = e.target.value.trimStart(); // chỉ trim start khi nhập
              setSpotifyLink(trimmed);
              // Kiểm tra link và cập nhật lỗi nếu sai
              if (trimmed === "" || isValidSpotifyTrackUrl(trimmed)) {
                setError("");
              } else {
                setError("Link Spotify track không hợp lệ");
              }
            }}
            placeholder="https://open.spotify.com/track/..."
            className="input p-2 rounded-md text-base-content outline-none w-full mb-4"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowSpotifyForm(false)}
              className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded font-semibold text-white ${
                loading || error !== ""
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-dark"
              }`}
              disabled={loading || error !== ""}
            >
              {loading ? "Đang tải..." : "Gửi"}
            </button>
          </div>
        </form>
      </div>

      {/* Popup Review */}
      <div
        className={`
          fixed inset-0 bg-black/50 backdrop-blur-sm
          flex justify-center items-center z-[9999] transition-all duration-300
          ${
            showReviewForm
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
        onClick={() => setShowReviewForm(false)}
      >
        <form
          onSubmit={handleReviewSubmit}
          className={`bg-base-200 border-2 border-dashed p-6 rounded-3xl max-w-md w-full mx-3 relative shadow-2xl
    transform transition-all duration-300 ease-out
    ${
      showReviewForm
        ? "scale-100 opacity-100 translate-y-0"
        : "scale-95 opacity-0 translate-y-4 pointer-events-none"
    }
  `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Nút đóng */}
          <button
            type="button"
            onClick={() => setShowReviewForm(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-base-300 hover:bg-base-400 flex items-center justify-center transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <label className="font-semibold block pr-8">Đánh giá (số sao):</label>
          <span className="text-xs text-error mb-2">Kéo để thay đổi</span>

          {/* Hiển thị sao nằm ngang dùng StarProgress */}
          <div className="flex items-center space-x-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const fillPercent = Math.min(
                100,
                Math.max(0, (reviewRating - (star - 1)) * 100)
              );

              return (
                <StarProgress
                  key={star}
                  size={24}
                  fillPercent={fillPercent}
                  className=""
                />
              );
            })}
          </div>

          {/* Hiển thị số sao + range input */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600 w-15">
              {reviewRating.toFixed(1)} / 5
            </span>
            <input
              type="range"
              min={0}
              max={5}
              step={0.1}
              value={reviewRating}
              onChange={(e) => setReviewRating(parseFloat(e.target.value))}
              className="range w-full ml-2"
            />
          </div>

          {/* Viết đánh giá */}
          <label className="text-base-content font-semibold mb-2 block">
            Viết đánh giá của bạn:
          </label>
          <input
            value={reviewText}
            onChange={(e) => {
              if (e.target.value.length <= 24) {
                setReviewText(e.target.value);
              }
            }}
            placeholder="Nhập vào đây giới hạn 24 ký tự..."
            className="input p-2 rounded-md text-base-content outline-none w-full mb-4"
          />

          {/* Button */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 rounded bg-gray-500 text-base-content hover:bg-gray-600 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-accent text-base-content font-semibold hover:bg-accent-focus transition-colors"
            >
              OK
            </button>
          </div>
        </form>
      </div>

      {/* Popup Weather Custom */}
      <div
        className={`
          fixed inset-0 bg-black/50 backdrop-blur-sm
          flex justify-center items-center z-[9999] transition-all duration-300
          ${
            showWeatherForm
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
        onClick={() => setShowWeatherForm(false)}
      >
        <form
          onSubmit={handleWeatherSubmit}
          className={`bg-base-200 border-2 border-dashed p-6 rounded-3xl max-w-md w-full mx-3 relative max-h-[90vh] overflow-y-auto shadow-2xl
    transform transition-all duration-300 ease-out
    ${
      showWeatherForm
        ? "scale-100 opacity-100 translate-y-0"
        : "scale-95 opacity-0 translate-y-4 pointer-events-none"
    }
  `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Nút đóng */}
          <button
            type="button"
            onClick={() => setShowWeatherForm(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-base-300 hover:bg-base-400 flex items-center justify-center transition-colors z-10 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="pr-8"> {/* Thêm padding để tránh overlap với nút đóng */}
            <label className="text-base-content font-semibold block mb-4">
              Tùy chỉnh thời tiết:
            </label>

            {/* Button sử dụng dữ liệu thực tế */}
            {weather && !weatherLoading && !weatherError && (
              <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-success">Dữ liệu thời tiết thực tế:</span>
                  <button
                    type="button"
                    onClick={handleUseRealWeather}
                    className="btn btn-success btn-sm"
                  >
                    Sử dụng
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <WeatherIcon weatherCode={weather.icon} className="w-5 h-5" />
                  <span>{weather.temp}°C {weather.desc}</span>
                </div>
              </div>
            )}

            {/* Chọn icon thời tiết */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Chọn icon:</label>
              <div className="grid grid-cols-3 gap-2">
                {weatherIcons.map((icon) => (
                  <button
                    key={icon.code}
                    type="button"
                    onClick={() => {
                      setSelectedWeatherIcon(icon.code);
                      setCustomWeatherDesc(icon.desc);
                    }}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      selectedWeatherIcon === icon.code
                        ? "border-primary bg-primary/10"
                        : "border-gray-300 hover:border-primary/50"
                    }`}
                  >
                    <WeatherIcon weatherCode={icon.code} className="w-8 h-8 mx-auto" />
                    <span className="text-xs mt-1 block">{icon.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nhiệt độ */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Nhiệt độ: {customTemperature}°C
              </label>
              <input
                type="range"
                min={-20}
                max={50}
                value={customTemperature}
                onChange={(e) => setCustomTemperature(parseInt(e.target.value))}
                className=" w-full" 
              />
            </div>

            {/* Mô tả thời tiết */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Mô tả:</label>
              <div className="space-y-2">
                {/* Input cho mô tả tùy chỉnh */}
                <input
                  type="text"
                  value={customWeatherDesc}
                  onChange={(e) => setCustomWeatherDesc(e.target.value)}
                  placeholder="Nhập mô tả thời tiết..."
                  className="input input-bordered w-full"
                  maxLength={20}
                />
                
                {/* Quick select buttons */}
                <div className="text-xs text-gray-500 mb-2">Hoặc chọn nhanh:</div>
                <div className="flex flex-wrap gap-1">
                  {weatherDescriptions.slice(0, 8).map((desc) => (
                    <button
                      key={desc}
                      type="button"
                      onClick={() => setCustomWeatherDesc(desc)}
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                        customWeatherDesc === desc
                          ? "bg-primary text-primary-content border-primary"
                          : "bg-base-200 border-base-300 hover:border-primary/50"
                      }`}
                    >
                      {desc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mb-4 p-3 bg-base-300 rounded-lg">
              <label className="block text-sm font-medium mb-2">Preview:</label>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <WeatherIcon weatherCode={selectedWeatherIcon} className="w-6 h-6" />
                <span>{customTemperature}°C {customWeatherDesc}</span>
              </div>
            </div>

            {/* Button */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowWeatherForm(false)}
                className="mb-50 px-4 py-2 rounded bg-gray-500 text-base-content hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="mb-50 px-4 py-2 rounded bg-accent text-base-content font-semibold hover:bg-accent-focus transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
