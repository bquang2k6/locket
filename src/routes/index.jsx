import AboutMe from "../pages/Auth/AboutMe";
import AuthHome from "../pages/Auth/Home";
import PostMoments from "../pages/Auth/PostMoments";
import Profile from "../pages/Auth/Profile";
import SettingsPage from "../pages/Public/Settings";
import AboutLocketDio from "../pages/Public/About";
import Docs from "../pages/Public/Docs";
import DonateHistory from "../pages/Public/HistoryDonate";
import Home from "../pages/Public/Home";
import Login from "../pages/Public/Login";
import PrivacyPolicy from "../pages/Public/PrivacyPolicy";
import RegisterMemberPage from "../pages/Public/RegisterMemberPage";
import Timeline from "../pages/Public/Timeline";
import CameraCapture from "../pages/UILocket";
import NodeInfo from "../pages/Auth/Nodeinfo";
import ChatPage from "../pages/Chat";
import ThemePage from "../pages/Public/Theme";
import CacheManagement from "../pages/Public/CacheManagement";

const APP_NAME = "Locket Wan - Đăng ảnh & Video lên Locket";

// 📌 Các route dành cho người chưa đăng nhập
const publicRoutes = [
  { path: "/", component: Home, title: `${APP_NAME} | Trang Chủ` },
  { path: "/test", component: AuthHome, title: `${APP_NAME} | Test` },
  { path: "/login", component: Login, title: `${APP_NAME} | Đăng Nhập` },
  { path: "/about", component: AboutLocketDio, title: `${APP_NAME} | Về Website Locket Wan` },
  { path: "/about-me", component: AboutMe, title: `${APP_NAME} | Về tôi` },
  { path: "/timeline", component: Timeline, title: `${APP_NAME} | Dòng Thời Gian` },
  { path: "/docs", component: Docs, title: `${APP_NAME} | Docs` },
  // { path: "/conta", component: Contact, title: `${APP_NAME} | Liên hệ` },
  { path: "/privacy", component: PrivacyPolicy, title: `${APP_NAME} | Privacy Policy for LocketWan - PrivacyPolicies.com` },
  { path: "/testv1", component: CameraCapture, title: `${APP_NAME} | Test` },
  { path: "/upgrade", component: RegisterMemberPage, title: `${APP_NAME} | Đăng ký gói thành viên` },
  { path: "/settings", component: SettingsPage, title: `${APP_NAME} | Cài đặt` },
  { path: "/theme", component: ThemePage, title: `${APP_NAME} | Tùy Chỉnh Giao Diện` },
  { path: "/cache", component: CacheManagement, title: `${APP_NAME} | Quản lý Cache` },
];

// 📌 Các route yêu cầu đăng nhập
const authRoutes = [
  { path: "/home", component: AuthHome, title: `${APP_NAME} | Trang chủ` },
  { path: "/profile", component: Profile, title: `${APP_NAME} | Hồ sơ` },
  { path: "/postmoments", component: PostMoments, title: `${APP_NAME} | Đăng Moment Mới` },
  { path: "/test", component: CameraCapture, title: `${APP_NAME} | Đăng Video Mới` },
  { path: "/timeline", component: Timeline, title: `${APP_NAME} | Dòng Thời Gian` },
  { path: "/aboutme", component: AboutMe, title: `${APP_NAME} | Về tôi` },
  { path: "/docs", component: Docs, title: `${APP_NAME} | Docs` },
  { path: "/donatehistory", component: DonateHistory, title: `${APP_NAME} | DonateHistory` },
  { path: "/upgrade", component: RegisterMemberPage, title: `${APP_NAME} | Đăng ký gói thành viên` },
  { path: "/locket", component: CameraCapture, title: `${APP_NAME} | Locket` },
  { path: "/settings", component: SettingsPage, title: `${APP_NAME} | Cài đặt` },
  { path: "/nodeinfo", component: NodeInfo, title: `${APP_NAME} | Node Info` },
  { path: "/chat", component: ChatPage, title: `${APP_NAME} | Chat` },
  { path: "/theme", component: ThemePage, title: `${APP_NAME} | Tùy Chỉnh Giao Diện` },
  { path: "/cache", component: CacheManagement, title: `${APP_NAME} | Quản lý Cache` },
];

// 📌 Các route dành cho locket
const locketRoutes = [
  // { path: "/test", component: CameraCapture, title: `${APP_NAME} | Trang chủ` },
];

export { publicRoutes, authRoutes, locketRoutes };
