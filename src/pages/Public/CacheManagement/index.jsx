import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { clearAllGifs, getCacheInfo } from "../../../helpers/gifCacheDB";
import { forceUpdate } from "../../../services/serviceWorker/serviceWorkerRegistration";

const CacheManagement = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [cacheInfo, setCacheInfo] = useState({});

  const reloadPage = () => setTimeout(() => window.location.reload(true), 1000);

  const loadCacheInfo = useCallback(async () => {
    try {
      const [gifInfo, cacheNames] = await Promise.all([
        getCacheInfo().catch(() => null),
        "caches" in window ? caches.keys() : [],
      ]);

      setCacheInfo({
        serviceWorker: !!(await navigator.serviceWorker?.ready)?.active,
        cacheStorage: cacheNames.length,
        localStorage: Object.keys(window.localStorage).length,
        sessionStorage: Object.keys(window.sessionStorage).length,
        gifCacheDB: gifInfo ? "Available" : "Not available",
        gifCount: gifInfo?.gifCount || 0,
        metaCount: gifInfo?.metaCount || 0,
      });
    } catch (err) {
      console.error("Error loading cache info:", err);
    }
  }, []);

  useEffect(() => {
    loadCacheInfo();
  }, [loadCacheInfo]);

  const handleClearAllCache = async () => {
    setIsClearing(true);
    try {
      // Clear caches
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }

      // Clear storages
      localStorage.clear();
      sessionStorage.clear();

      // Clear gifCacheDB
      await clearAllGifs();

      toast.success("Đã xóa tất cả cache thành công!");

      // ⏩ Chuyển sang trang đăng nhập
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (err) {
      console.error("Clear cache failed:", err);
      toast.error("Xóa cache thất bại!");
      setIsClearing(false);
    }
  };


  const handleForceUpdate = async () => {
    try {
      await forceUpdate();
      toast.success("Đã force update service worker!");
      reloadPage();
    } catch (err) {
      console.error("Force update failed:", err);
      toast.error("Force update thất bại!");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-8">
  <div className="max-w-4xl mx-auto px-4">
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-base-content mt-10">Cập nhật web</h1>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-base-100 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-error">Bảng điều khiển</h2>
        <div className="space-y-3">
          <button
            onClick={handleClearAllCache}
            disabled={isClearing}
            className="w-full btn btn-error"
          >
            {isClearing ? "⏳ Đang xóa..." : "Ấn để cập nhật (sẽ phải đăng nhập lại)"}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

  );
};

export default CacheManagement;
