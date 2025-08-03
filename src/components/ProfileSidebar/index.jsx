import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronRight, 
  Settings, 
  Palette, 
  Edit3, 
  Package, 
  User, 
  Mail, 
  MessageCircle, 
  AlertCircle,
  Music,
  Gift,
  Share2,
  Camera,
  Users,
  Shield,
  Trash2,
  LogOut,
  Upload,
  Smartphone,
  TrendingUp,
  X
} from 'lucide-react';
import { AuthContext } from '../../context/AuthLocket';
import { useApp } from '../../context/AppContext';
import { ThemeContext } from '../../context/ThemeContext';
import * as ultils from '../../utils';
import { showToast } from '../Toast';

const ProfileSidebar = () => {
  const { user, setUser, resetAuthContext } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { navigation } = useApp();
  const [imageLoaded, setImageLoaded] = useState(false);

  const { isSidebarOpen, setIsSidebarOpen } = navigation;

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isSidebarOpen]);

  const handleLogout = async () => {
    try {
      resetAuthContext();
      ultils.clearLocalData();
      showToast("success", "Đăng xuất thành công!");
      navigate("/login");
      setIsSidebarOpen(false);
    } catch (error) {
      showToast("error", "Đăng xuất thất bại!");
      console.error("❌ Lỗi khi đăng xuất:", error);
    }
  };

  // Hàm lấy màu sắc theo theme
  const getThemeColors = () => {
    const isDark = theme === 'dark' || theme === 'black' || theme === 'dracula' || theme === 'night' || theme === 'coffee';
    const isLight = theme === 'light' || theme === 'cupcake' || theme === 'pastel' || theme === 'fantasy';
    
    if (isDark) {
      return {
        bg: 'bg-gray-900',
        sidebarBg: 'bg-gray-800',
        text: 'text-white',
        textSecondary: 'text-gray-300',
        border: 'border-gray-700',
        hover: 'hover:bg-gray-700',
        accent: 'text-orange-400',
        danger: 'text-red-500'
      };
    } else if (isLight) {
      return {
        bg: 'bg-white',
        sidebarBg: 'bg-gray-100',
        text: 'text-gray-900',
        textSecondary: 'text-gray-600',
        border: 'border-gray-200',
        hover: 'hover:bg-gray-200',
        accent: 'text-orange-600',
        danger: 'text-red-600'
      };
    } else {
      // Theme màu sắc khác - sử dụng CSS variables
      return {
        bg: 'bg-base-100',
        sidebarBg: 'bg-base-200',
        text: 'text-base-content',
        textSecondary: 'text-base-content/70',
        border: 'border-base-300',
        hover: 'hover:bg-base-300',
        accent: 'text-primary',
        danger: 'text-error'
      };
    }
  };

  const colors = getThemeColors();

  const MenuItem = ({ icon: Icon, text, hasArrow = true, textColor = colors.text, danger = false, onClick }) => (
    <div 
      className={`flex items-center justify-between py-3 px-4 ${danger ? colors.danger : textColor} cursor-pointer ${colors.hover} transition-colors`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <Icon size={20} className={danger ? colors.danger : colors.accent} />
        <span className="text-sm font-medium">{text}</span>
      </div>
      {hasArrow && <ChevronRight size={16} className={colors.textSecondary} />}
    </div>
  );

  const SectionTitle = ({ title }) => (
    <div className="px-4 py-2 mt-6">
      <h3 className={`${colors.text} text-sm font-semibold`}>{title}</h3>
    </div>
  );

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed h-screen z-60 inset-0 bg-base-100/10 backdrop-blur-[2px] transition-opacity duration-500 ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed z-60 top-0 right-0 h-full w-80 shadow-xl transform transition-transform duration-300 ${colors.sidebarBg} ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${colors.border}`}>
          <div className="w-6"></div>
          <div className="w-6"></div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className={`p-2 rounded-md transition cursor-pointer ${colors.hover}`}
          >
            <X size={20} className={colors.text} />
          </button>
        </div>

        <div className="h-[calc(100vh-64px)] overflow-y-auto">
          {/* Profile Section */}
          <div className="flex flex-col items-center px-4 mb-6 pt-4">
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-full border-4 border-orange-400 overflow-hidden">
                <img 
                  src={user?.profilePicture || "/default-avatar.png"}
                  alt="Profile" 
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            </div>
            <h1 className={`${colors.text} text-xl font-semibold mb-1`}>
              {user?.username || "User"}
            </h1>
            <a
              href={`https://locket.cam/${user?.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${colors.accent} text-sm underline`}
            >
              locket.cam/{user?.username}
            </a>
          </div>

          {/* Hồ sơ */}
          <div className="mx-4 mb-4">
            <div className={`${colors.bg} rounded-lg p-3 flex items-center justify-between`}>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full ${colors.sidebarBg} flex items-center justify-center`}>
                  <User size={16} className={colors.accent} />
                </div>
                <div>
                  <p className={`${colors.text} text-sm font-medium`}>Mời bạn bè tham gia Locket!</p>
                  <p className={`${colors.textSecondary} text-xs`}>
                    <a
                      href={`https://locket.cam/${user?.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${colors.accent} underline`}
                    >
                      Chia sẻ link
                    </a>
                  </p> 
                </div>
              </div>
              <Share2 size={16} className={colors.textSecondary} />
            </div>
          </div>

          {/* Menu thay thể side bar*/}
          <SectionTitle title="Locket Wan" />
          <div className={`${colors.bg} mx-4 rounded-lg`}>
            <MenuItem 
              icon={Smartphone} 
              text="Quay về giao diện chính" 
              onClick={() => {
                navigate('/locket');
                setIsSidebarOpen(false);
              }}
            />
            <MenuItem 
              icon={Settings} 
              text="Cài đặt" 
              onClick={() => {
                navigate('/settings');
                setIsSidebarOpen(false);
              }}
            />
            <MenuItem 
              icon={Palette} 
              text="Cài đặt giao diện" 
              onClick={() => {
                navigate('/theme');
                setIsSidebarOpen(false);
              }}
            />
            <MenuItem 
              icon={Package} 
              text="Quản lý Gói đăng ký" 
              onClick={() => {
                navigate('/upgrade');
                setIsSidebarOpen(false);
              }}
            />
            <MenuItem 
              icon={MessageCircle} 
              text="Phòng chat chung" 
              onClick={() => {
                navigate('/chat');
                setIsSidebarOpen(false);
              }}
            />
            <MenuItem 
              icon={Upload} 
              text=" Đăng ảnh, video" 
              onClick={() => {
                navigate('/postmoments');
                setIsSidebarOpen(false);
              }}
            />
          </div>


          {/* General Section */}
          <SectionTitle title="Hồ sơ" />
          <div className={`${colors.bg} mx-4 rounded-lg`}>
            <MenuItem 
              icon={User} 
              text={user?.displayName || "Tên"} 
              onClick={() => {
                navigate('/profile');
                setIsSidebarOpen(false);
              }}
            />
            {/* <MenuItem 
              icon={Mail} 
              text={user?.email || "Địa chỉ email"} 
              onClick={() => {
                navigate('/profile');
                setIsSidebarOpen(false);
              }}
            /> */}
            {/* <MenuItem 
              icon={Edit3} 
              text="Chi tiết"
              onClick={() => {
                navigate('/profile');
                setIsSidebarOpen(false);
              }}
            /> */}
          </div>

          {/* Support Section */}
          <SectionTitle title="Hỗ trợ" />
          <div className={`${colors.bg} mx-4 rounded-lg`}>
            {/* <MenuItem 
              icon={MessageCircle} 
              text="Gửi đề xuất" 
              onClick={() => {
                window.open('https://discord.gg/locket', '_blank');
                setIsSidebarOpen(false);
              }}
            /> */}
            <MenuItem 
              icon={AlertCircle} 
              text="Gửi đề xuất, Báo cáo sự cố" 
              onClick={() => {
                window.open('https://quang-tech.space', '_blank');
                setIsSidebarOpen(false);
              }}
            />
            <MenuItem 
              icon={Gift} 
              text="Donate" 
              onClick={() => {
                navigate('/aboutme');
                setIsSidebarOpen(false);
              }}
            />
            <MenuItem 
              icon={TrendingUp} 
              text="Trend lý tuân các kiểu tại đây" 
              onClick={() => {
                window.open('https://quang-tech.space', '_blank');
                setIsSidebarOpen(false);
              }}
            />
          </div>

          {/* About Section */}
          <SectionTitle title="Giới thiệu và quyền riêng tư" />
          <div className={`${colors.bg} mx-4 rounded-lg`}>
            <MenuItem 
              icon={Share2} 
              text="Chia sẻ Locket wan" 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Locket Wan',
                    url: 'https://locket.cam'
                  });
                }
                setIsSidebarOpen(false);
              }}
            />
            <MenuItem 
              icon={Camera} 
              text="Về Locket Wan" 
              onClick={() => {
                navigate('/docs');
                setIsSidebarOpen(false);
              }}
            />
          </div>

          {/* Dangerous Zone */}
          <SectionTitle title="Vùng nguy hiểm" />
          <div className={`${colors.bg} mx-4 rounded-lg mb-20`}>
            <MenuItem 
              icon={LogOut} 
              text="Đăng xuất" 
              danger={true} 
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileSidebar; 