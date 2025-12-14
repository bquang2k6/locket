import React, { useState, useContext } from "react";
import {
  Send,
  History,
  MessageCircle,
  Menu,
  User,
  LogOut,
  Palette,
  Package,  
  Settings, 
  AlertCircle,
  Gift,
  Camera,
  
  
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useNavigate, useLocation } from "react-router-dom";
import { MdOutlineUpdate } from 'react-icons/md';

import { AuthContext } from "../../context/AuthLocket";
import * as ultils from "../../utils";
import { showToast } from "../Toast";



export default function LiquidGlassTaskbar() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeItem, setActiveItem] = useState("home");

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { navigation } = useApp();
  const { setIsBottomOpen } = navigation;
  const { resetAuthContext } = useContext(AuthContext);
  const handleLogout = async () => {
    try {
      resetAuthContext();
      ultils.clearLocalData();
      showToast("success", "Đăng xuất thành công!");
      navigate("/login");
      setShowSidebar(false);
    } catch (error) {
      showToast("error", "Đăng xuất thất bại!");
      console.error("❌ Lỗi khi đăng xuất:", error);
    }
  };

  

  // Ẩn ở login + chat
  if (pathname.startsWith("/login") || pathname.startsWith("/chat")) {
    return null;
  }

  const menuItems = [
    { id: "home", label: "Trang Chủ", icon: Send, href: "/locket" },
    { id: "history", label: "Lịch sử", icon: History, type: "history" },
    { id: "chat", label: "Chat", icon: MessageCircle, href: "/chat" },
  ];

  const sidebarItems = [
    { id: "Palette", label: "Cài đặt giao diện", icon: Palette, href: "/theme" },
    { id: "Setting", label: "Cài đặt", icon: Settings, href: "/settings" },
    { id: "Package", label: "Quản lý gói đăng ký", icon: Package, href: "/upgrade" },
    { id: "User", label: "Hồ sơ", icon: User, href: "/profile" },
    { id: "MdOutlineUpdate", label: "Cập nhật lên bản mới", icon: MdOutlineUpdate, href: "/cache"},
    { id: "AlertCircle", label: "Gửi đề xuất, Báo cáo sự cố", icon: AlertCircle, href: "https://wangtech.top" },
    { id: "History", label: "Lịch sử hình thành", icon: History, href: "/timeline" },
    { id: "Gift", label: "Ủng hộ dự án", icon: Gift, href: "/aboutme" },
    { id: "Camera", label: "Quyền riêng tư", icon: Camera, href: "/docs" },
    { id: "logout", label: "Đăng xuất", icon: LogOut, action: "logOut" },
  ];

  return (
    <>
      {/* ===== Overlay ===== */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          showSidebar ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowSidebar(false)}
      />

      {/* ===== Sidebar ===== */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw]
          transition-transform duration-300
          ${showSidebar ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="h-full p-4">
          <div className="h-full rounded-3xl bg-base-100/60 backdrop-blur-3xl border border-base-content/10 shadow-xl p-4">
            <div className="space-y-1">
              {sidebarItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  {(index === 9) && <div className="divider" />}
                  <button
                    onClick={() => {
                      if (item.action === "logout") {
                        handleLogout();
                        return;
                      }

                      if (item.href?.startsWith("http")) {
                        window.open(item.href, "_blank");
                      } else if (item.href) {
                        navigate(item.href);
                      }

                      setShowSidebar(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl
                      hover:bg-base-200/60 transition text-base-content
                      ${item.action === "logout" ? "text-error" : ""}`}
                  >
                    <item.icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Bottom Taskbar ===== */}
      <div className="fixed bottom-4 left-0 right-0 z-30 px-4">
        <div className="rounded-full bg-base-100/60 backdrop-blur-3xl border border-base-content/10 shadow-xl px-4">
          <div className="flex items-center justify-between">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeItem === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveItem(item.id);

                    if (item.type === "history") {
                      setIsBottomOpen(true);
                    }
                    if (item.href) navigate(item.href);
                  }}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition
                    ${
                      active
                        ? "text-primary scale-105"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                >
                  <Icon size={22} strokeWidth={1.6} />
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}

            {/* Menu button */}
            <button
              onClick={() => setShowSidebar(true)}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl
                text-base-content/70 hover:text-base-content transition"
            >
              <Menu size={22} strokeWidth={1.6} />
              <span className="text-xs">Danh mục</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
