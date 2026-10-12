import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import Loading from "../components/Loading";
import Footer from "../components/Footer";
import PlanDetailModal from "../components/UI/Modal/PlanDetailModal";

const DefaultLayout = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const isHome = location.pathname === "/" || location.pathname === "/home";

  // Handle loading state on route change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className={`grid grid-rows-[auto_1fr_auto] ${isHome ? 'bg-[#FFFBF1]' : ''}`}>
      {/* Fixed Header (chỉ hiển thị cho các trang khác, trang Home có Header riêng) */}
      {!isHome && <Header />}
      {isLoading && (
        <div className="absolute inset-0 z-20">
          <Loading />
        </div>
      )}
      {/* Main Content with Scroll */}
      <main className={`overflow-hidden relative ${isHome ? 'bg-[#FFFBF1]' : 'bg-base-200 text-base-content'}`}>
        <div className="relative z-10">{children}</div>
      </main>
      <PlanDetailModal />
      {!isHome && <Footer />}
    </div>
  );
};

export default DefaultLayout;
