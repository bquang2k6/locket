import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // For animations
import ThemeSelector from "../../../components/Theme/ThemeSelector";

const AuthHome = () => {
  // Animation variants for fade-in and slide-up effects
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 py-12 px-6 flex flex-col items-center justify-center">
      {/* Hero Section */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl w-full items-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Text Content */}
        <div className="text-center lg:text-left space-y-6">
          <motion.h1
            className="mt-10 text-5xl md:text-6xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
            variants={containerVariants}
          >
            Chia sẻ khoảnh khắc <br /> với <span className="italic">Locket</span>!
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-base-content/80 max-w-lg mx-auto lg:mx-0"
            variants={containerVariants}
          >
            Lưu giữ và chia sẻ những kỷ niệm đáng nhớ với bạn bè và gia đình một cách dễ dàng và an toàn.
          </motion.p>
          <div className="flex justify-center items-center -mb-15">
            <motion.div variants={containerVariants}>
              <Link
                to="/locket"
                className="justify-center items-center flex w-[200px] h-[50px] rounded-full shadow-lg btn btn-primary text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary-focus hover:to-secondary-focus transition-all transform hover:scale-105"
              >
                Khám phá ngay
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Mockup iPhone */}
        
      </motion.div>

      {/* Features Section */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full mt-16 mb-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        {[
          {
            icon: "📷",
            title: "Up ảnh & video",
            description: "Tải ảnh và video lên từ thư viện hoặc quay trực tiếp ngay trong app.",
          },
          {
            icon: "🎥",
            title: "Quay video",
            description: "Ghi lại khoảnh khắc với camera tích hợp sẵn, không cần app khác.",
          },
          {
            icon: "📱",
            title: "Cài đặt màn hình chính",
            description: "Thêm app vào màn hình chính để truy cập nhanh chóng như ứng dụng native.",
          },
          {
            icon: "👥",
            title: "Xem ảnh bạn bè",
            description: "Theo dõi và xem những khoảnh khắc mà bạn bè của bạn đã đăng.",
          },
          {
            icon: "📊",
            title: "Xem Rollcall",
            description: "Kiểm tra ai đang online và hoạt động trong nhóm của bạn.",
          },
          {
            icon: "✍️",
            title: "Caption đa dạng",
            description: "Tùy chỉnh caption với nhiều style và emoji để thể hiện cảm xúc.",
          },
          {
            icon: "🔄",
            title: "Update thường xuyên",
            description: "Nhận các tính năng mới và cải tiến liên tục từ đội ngũ phát triển.",
          },
          {
            icon: "🔒",
            title: "Bảo mật an toàn",
            description: "Kiểm soát dữ liệu của bạn với máy chủ riêng, đảm bảo an toàn tuyệt đối.",
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            className="p-6 bg-base-100 shadow-xl rounded-2xl text-center border border-base-300 hover:shadow-2xl transition-shadow duration-300"
            variants={cardVariants}
            whileHover={{ y: -5 }}
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h2 className="text-xl font-semibold mb-3 text-base-content">
              {feature.title}
            </h2>
            <p className="text-base-content/70">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Theme Selector */}
      <motion.div
        className="mt-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <ThemeSelector />
      </motion.div>
    </div>
  );
};

export default AuthHome;