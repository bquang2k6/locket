import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaDownload, FaShieldAlt, FaMobileAlt, FaArrowLeft } from "react-icons/fa";

const Download = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.2 },
    },
  };
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };


  const stepVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const PreviewImages = [
    {
      title: "Bước 1: Tải APK",
      img: "/images/preview/1.png",
    },
    {
      title: "Bước 2: Cho phép cài đặt",
      img: "/images/preview/2.png",
    },
    {
      title: "Bước 3: Mở ứng dụng",
      img: "/images/preview/3.png",
    },
    {
      title: "Bước 3: Mở ứng dụng",
      img: "/images/preview/4.png",
    },
    {
      title: "Bước 3: Mở ứng dụng",
      img: "/images/preview/5.png",
    },
    {
      title: "Bước 3: Mở ứng dụng",
      img: "/images/preview/6.png",
    },
    {
      title: "Bước 3: Mở ứng dụng",
      img: "/images/preview/7.png",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Nút quay lại */}
        <Link to="/" className="btn btn-ghost gap-2 mb-8 mt-10">
          <FaArrowLeft /> Quay lại
        </Link>


        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-4">
            Cài đặt Locket Wan cho Android
          </h1>
          <p className="text-lg text-base-content/70">
            Trải nghiệm mượt mà hơn với ứng dụng dành riêng cho điện thoại .
          </p>
        </motion.div>
        {/* Section: Tính năng nổi bật */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 max-w-7xl w-full mt-10 md:mt-16 mb-8 md:mb-12 px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {[
            {
              icon: "🌈",
              title: "Caption đa sắc màu",
              desc: "có thể thêm ảnh chính mình làm icon caption",
              color: "from-pink-500 to-yellow-500"
            },
            {
              icon: "📜",
              title: "Xem lại Lịch sử đã đăng",
              desc: "",
              color: "from-blue-400 to-emerald-400"
            },
            {
              icon: "📜",
              title: "Ai đã xem bài viết",
              desc: "",
              color: "from-blue-400 to-emerald-400"
            },
            {
              icon: "🔥",
              title: "Giữ chuỗi Streak",
              desc: "",
              color: "from-orange-500 to-red-600"
            },
            {
              icon: "📶",
              title: "Chế độ Ngoại tuyến",
              desc: "Tự tải lên khi có mạng",
              color: "from-indigo-500 to-purple-500"
            },
            {
              icon: "💬",
              title: "Nhắn tin tức thời",
              desc: "",
              color: "from-cyan-400 to-blue-600"
            },
            {
              icon: "🔔",
              title: "Rollcall",
              desc: "có thể xem lịch sử rollcall của tuần trước",
              color: "from-yellow-400 to-orange-500"
            },
            {
              icon: "📤",
              title: "Up ảnh & Video",
              desc: "video max 15mb, video max 30mb (free)",
              color: "from-green-400 to-cyan-500"
            },
            {
              icon: "🎨",
              title: "Giao diện tùy biến",
              desc: "Đổi theme dễ dàng",
              color: "from-purple-400 to-pink-600"
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="group relative p-4 md:p-8 bg-base-100 shadow-lg md:shadow-xl rounded-2xl md:rounded-3xl border border-base-300 overflow-hidden transition-all"
              variants={cardVariants}
              whileHover={{ y: -10 }}
            >
              {/* Hover background */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${feature.color} transition-opacity`} />

              <div className="relative z-10 text-center md:text-left">
                <div className="text-3xl md:text-5xl mb-2 md:mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>

                <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-2 text-base-content group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>

                <p className="text-xs md:text-sm text-base-content/70 leading-relaxed line-clamp-2">
                  {feature.description || feature.desc}
                </p>
              </div>

              {/* Gradient line */}
              <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r ${feature.color} transition-all duration-500`} />
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Cột các bước hướng dẫn */}
          <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >

            <motion.div
              className="space-y-8"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                {PreviewImages.map((step, index) => (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    className="bg-base-100 rounded-2xl shadow-md border border-base-300 overflow-hidden"
                  >
                    <img
                      src={step.img}
                      alt=""
                      className="w-full aspect-[8/19] object-cover"
                    />
                  </motion.div>
                ))}
              </motion.div>

            </motion.div>

          </motion.div>

          {/* Cột Action & Hình ảnh minh họa */}
          <motion.div
            className="flex flex-col items-center justify-center p-8 bg-base-100 rounded-3xl shadow-xl border-2 border-primary/20"
            variants={containerVariants}
          >

            <a
              href="https://apk.locket-wan.top"
              className="btn btn-primary btn-lg w-full rounded-full shadow-lg bg-gradient-to-r from-primary to-secondary border-none hover:scale-105 transition-transform"
            >
              Tải APK ngay (Mới nhất)
            </a>
            <p className="mt-4 text-xs text-base-content/50 text-center">
              Dung lượng: ~256MB | Phiên bản:  v1.0.0
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Download;