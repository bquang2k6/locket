import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { clearAllGifs } from '../../helpers/gifCacheDB';

const CacheManager = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Kiểm tra service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Lắng nghe sự kiện update
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setIsUpdateAvailable(true);
              toast.info('Có phiên bản mới! Nhấn để cập nhật.', {
                onClick: () => handleUpdate(),
                autoClose: false,
                closeOnClick: true,
                draggable: true,
              });
            }
          });
        });

        // Kiểm tra nếu có update pending
        if (registration.waiting) {
          setIsUpdateAvailable(true);
        }
      });
    }
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Clear tất cả cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Clear gifCacheDB
      await clearAllGifs();

      // Force reload để nhận phiên bản mới
      window.location.reload(true);
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Cập nhật thất bại. Vui lòng thử lại.');
      setIsUpdating(false);
    }
  };

  const handleQuickRefresh = () => {
    // Force reload với cache bypass
    window.location.reload(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col gap-2">
        {isUpdateAvailable && (
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors disabled:opacity-50"
          >
            {isUpdating ? 'Đang cập nhật...' : 'Cập nhật phiên bản mới'}
          </button>
        )}
        
        
      </div>
    </div>
  );
};

export default CacheManager; 