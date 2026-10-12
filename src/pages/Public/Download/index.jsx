import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const Download = () => {
  useEffect(() => {
    window.location.href = "https://apk.locket-wan.top/download";
  }, []);
  const PreviewImages = [
    {
      img: "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/screenshot/Screenshot_2026-08-03-09-10-32-755_com.quang2k6.locketwan.jpg",
    },
    {
      img: "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/screenshot/Screenshot_2026-08-03-09-10-40-860_com.quang2k6.locketwan.jpg",
    },
    {
      img: "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/screenshot/Screenshot_2026-08-03-09-10-48-591_com.quang2k6.locketwan.jpg",
    },
    {
      img: "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/screenshot/Screenshot_2026-08-03-09-10-57-421_com.quang2k6.locketwan.jpg",
    },
    {
      img: "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/screenshot/Screenshot_2026-08-03-09-11-07-997_com.quang2k6.locketwan.jpg",
    },
    {
      img: "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/screenshot/Screenshot_2026-08-03-09-11-29-316_com.quang2k6.locketwan.jpg",
    },
    {
      img: "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/screenshot/Screenshot_2026-08-03-09-15-10-767_com.quang2k6.locketwan.jpg",
    },
    {
      img: "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/screenshot/Screenshot_2026-08-03-09-31-09-686_com.quang2k6.locketwan.jpg",
    },
  ];

  const features = [
    {
      icon: "🌈",
      title: "Caption đa sắc màu",
      desc: "Caption màu sắc khác nhau theo sở thích người dùng",
      color: "from-pink-500 to-yellow-500",
    },
    {
      icon: "📜",
      title: "Xem lại Lịch sử đã đăng",
      desc: "Ai đã xem bài viết",
      color: "from-blue-400 to-emerald-400",
    },
    {
      icon: "🔥",
      title: "Giữ chuỗi Streak",
      desc: "Khôi phục chuỗi",
      color: "from-orange-500 to-red-600",
    },
    {
      icon: "📶",
      title: "Chế độ Ngoại tuyến",
      desc: "Tự tải lên khi có mạng",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: "💬",
      title: "Nhắn tin tức thời",
      desc: "",
      color: "from-cyan-400 to-blue-600",
    },
    {
      icon: "📤",
      title: "Up ảnh & Video",
      desc: "Upload ảnh, video không giới hạn",
      color: "from-green-400 to-cyan-500",
    },
    {
      icon: "🎨",
      title: "Giao diện tùy biến",
      desc: "Đổi theme dễ dàng",
      color: "from-purple-400 to-pink-600",
    },
    {
      icon: "📅",
      title: "Tính năng lịch giống iOS",
      desc: "",
      color: "from-purple-400 to-pink-600",
    },
    {
      icon: "🖼️",
      title: "Tùy chỉnh khung widget (beta)",
      desc: "",
      color: "from-purple-400 to-pink-600",
    },
    {
      icon: "👥",
      title: "Tính năng kết bạn",
      desc: "Tìm kiếm bạn bè, kết bạn, kết bạn với celeb",
      color: "from-purple-400 to-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Nút quay lại */}
        <Link
          to="/"
          className="btn btn-ghost mt-10 mb-8 gap-2 transition-all duration-300 hover:-translate-x-1"
        >
          <FaArrowLeft />
          Quay lại
        </Link>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl font-extrabold text-transparent md:text-5xl">
            Locket Dio x Locket Wan
          </h1>

          <p className="text-lg text-base-content/70">
            Trải nghiệm mượt mà hơn với ứng dụng dành riêng cho điện thoại
            Android, giao diện được lấy ý tưởng từ Locket Dio.
          </p>
          <div className="mt-6 flex justify-center">
            <a
              href="https://apk.locket-wan.top/download"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg rounded-2xl gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              📥 Tải Locket Wan APK
            </a>
          </div>
        </div>

        {/* Tính năng nổi bật */}
        <div className="mx-auto mt-10 mb-8 grid w-full max-w-7xl grid-cols-2 gap-3 px-4 md:mt-16 md:mb-12 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl md:rounded-3xl md:p-8"
            >
              {/* Hover background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
              />

              <div className="relative z-10 text-center md:text-left">
                {/* Icon */}
                <div className="mb-2 text-3xl transition-transform duration-300 group-hover:scale-110 md:mb-4 md:text-5xl">
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="mb-1 text-sm font-bold text-base-content transition-colors duration-300 group-hover:text-primary md:mb-2 md:text-xl">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="line-clamp-2 text-xs leading-relaxed text-base-content/70 md:text-sm">
                  {feature.desc}
                </p>
              </div>

              {/* Gradient line */}
              <div
                className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${feature.color} transition-all duration-500 group-hover:w-full`}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-12">
          {/* Preview ảnh */}
          <div className="w-full space-y-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
              {PreviewImages.map((item, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <img
                    src={item.img}
                    alt={`Locket Wan Preview ${index + 1}`}
                    loading="lazy"
                    className="aspect-[8/19] w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Tham khảo & liên hệ */}
          <div className="mt-10 w-full rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
            <h2 className="mb-6 text-center text-xl font-bold md:text-2xl">
              Tham khảo & liên hệ
            </h2>

            <div className="mx-auto flex max-w-xl flex-col gap-3">
              <a
                href="https://apk.locket-wan.top/download"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline justify-start gap-3 rounded-xl transition-all duration-300 hover:translate-x-1"
              >
                🌐 Tải APK Locket Wan
              </a>

              <a
                href="https://www.facebook.com/profile.php?id=61587155137185"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline justify-start gap-3 rounded-xl transition-all duration-300 hover:translate-x-1"
              >
                📘 Trang Facebook chính thức
              </a>

              <a
                href="https://m.me/ch/AbYrAzHe2so0FyZ7/?send_source=cm%3Acopy_invite_link"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline justify-start gap-3 rounded-xl transition-all duration-300 hover:translate-x-1"
              >
                💬 Nhóm Messenger hỗ trợ & trao đổi
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Download;