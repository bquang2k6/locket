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

  const steps = [
    {
      title: "Tải tệp APK",
      desc: "Nhấn vào nút tải xuống bên dưới để nhận bản cài đặt mới nhất.",
      icon: <FaDownload className="text-primary" />,
    },
    {
      title: "Cho phép cài đặt",
      desc: "Nếu có cảnh báo, hãy vào Cài đặt > Cho phép cài đặt ứng dụng từ nguồn không xác định.",
      icon: <FaShieldAlt className="text-secondary" />,
    },
    {
      title: "Hoàn tất & Trải nghiệm",
      desc: "Mở ứng dụng Locket Wan, đăng nhập và bắt đầu chia sẻ khoảnh khắc ngay!",
      icon: <FaMobileAlt className="text-accent" />,
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full mt-16 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            >
            {[
                {
                icon: "🌈",
                title: "Caption đa sắc màu",
                desc: "",
                color: "from-pink-500 to-yellow-500"
                },
                {
                icon: "📜",
                title: "Xem lại Lịch sử đã đăng",
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
                desc: "Đăng ảnh ngay cả khi không có mạng. App sẽ tự động tải lên khi bạn kết nối trở lại.",
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
                desc: "",
                color: "from-yellow-400 to-orange-500"
                },
                {
                icon: "📤",
                title: "Up ảnh & Video ",
                desc: "",
                color: "from-green-400 to-cyan-500"
                },
                {
                icon: "🎨",
                title: "Giao diện tùy biến",
                desc: "Thay đổi chủ đề (Theme) theo sở thích cá nhân với kho màu sắc đa dạng.",
                color: "from-purple-400 to-pink-600"
                },
            ].map((feature, index) => (
                <motion.div
                    key={index}
                    className="group relative p-8 bg-base-100 shadow-xl rounded-3xl border border-base-300 overflow-hidden transition-all"
                    variants={cardVariants}
                    whileHover={{ y: -10 }}
                    >
                {/* Hiệu ứng nền khi hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${feature.color} transition-opacity`} />
                
                <div className="relative z-10">
                    <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-base-content group-hover:text-primary transition-colors">
                    {feature.title}
                    </h3>
                    <p className="text-base-content/70 text-sm leading-relaxed">
                    {feature.description || feature.desc}
                    </p>
                </div>

                {/* Đường kẻ gradient nhỏ dưới đáy card */}
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
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                variants={stepVariants}
                className="flex gap-4 p-6 bg-base-100 rounded-2xl shadow-md border border-base-300"
              >
                <div className="text-3xl mt-1">{step.icon}</div>
                <div>
                  <h3 className="font-bold text-xl mb-1 text-base-content">
                    Bước {index + 1}: {step.title}
                  </h3>
                  <p className="text-base-content/70">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Cột Action & Hình ảnh minh họa */}
          <motion.div 
            className="flex flex-col items-center justify-center p-8 bg-base-100 rounded-3xl shadow-xl border-2 border-primary/20"
            variants={containerVariants}
          >
            
            <a
              href="https://expo.dev/artifacts/eas/fBLqGr9XAabKFSTVa4wrbx.apk"
              className="btn btn-primary btn-lg w-full rounded-full shadow-lg bg-gradient-to-r from-primary to-secondary border-none hover:scale-105 transition-transform"
            >
              Tải APK ngay (Mới nhất)
            </a>
            <p className="mt-4 text-xs text-base-content/50 text-center">
              Dung lượng: ~128MB | Phiên bản:  v1.0.0
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Download;