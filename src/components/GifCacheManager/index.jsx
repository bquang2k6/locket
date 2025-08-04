import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import gifCacheDB from '../../helpers/gifCacheDB';

const GifCacheManager = () => {
  const [cacheInfo, setCacheInfo] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadCacheInfo();
  }, []);

  const loadCacheInfo = async () => {
    try {
      const info = await gifCacheDB.getCacheInfo();
      setCacheInfo(info);
    } catch (error) {
      console.error('Error loading cache info:', error);
    }
  };

  const updateAllGifs = async () => {
    setIsUpdating(true);
    try {
      // Lấy danh sách tất cả GIF URLs từ gifList
      // Đây là một ví dụ, bạn có thể thay đổi theo nhu cầu
      const gifUrls = [
        // Thêm URLs của GIFs vào đây
      ];

      let updatedCount = 0;
      let totalCount = gifUrls.length;

      for (const url of gifUrls) {
        try {
          const result = await gifCacheDB.updateGifIfNeeded(url, {
            version: '1.0',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          
          if (result.updated) {
            updatedCount++;
            console.log(`Updated GIF: ${url}`);
          }
        } catch (error) {
          console.error(`Error updating GIF ${url}:`, error);
        }
      }

      await loadCacheInfo();
      
      if (updatedCount > 0) {
        toast.success(`Đã cập nhật ${updatedCount}/${totalCount} GIFs!`);
      } else {
        toast.info('Tất cả GIFs đã là phiên bản mới nhất!');
      }
    } catch (error) {
      console.error('Error updating GIFs:', error);
      toast.error('Cập nhật GIFs thất bại!');
    } finally {
      setIsUpdating(false);
    }
  };

  const clearGifCache = async () => {
    try {
      await gifCacheDB.clearAllGifs();
      await loadCacheInfo();
      toast.success('Đã xóa tất cả GIF cache!');
    } catch (error) {
      console.error('Error clearing GIF cache:', error);
      toast.error('Xóa GIF cache thất bại!');
    }
  };

  const checkGifUpdate = async (url) => {
    try {
      const needsUpdate = await gifCacheDB.shouldUpdateGif(url);
      const metadata = await gifCacheDB.getGifMetadata(url);
      
      console.log(`GIF ${url} needs update:`, needsUpdate);
      console.log('Metadata:', metadata);
      
      return { needsUpdate, metadata };
    } catch (error) {
      console.error('Error checking GIF update:', error);
      return { needsUpdate: true, metadata: null };
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="flex flex-col gap-2">
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="font-bold text-lg mb-2">🎨 GIF Cache Manager</h3>
          
          {cacheInfo && (
            <div className="text-sm mb-3">
              <p>📊 Cached GIFs: {cacheInfo.gifCount}</p>
              <p>📋 Metadata: {cacheInfo.metaCount}</p>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <button
              onClick={updateAllGifs}
              disabled={isUpdating}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition-colors disabled:opacity-50"
            >
              {isUpdating ? 'Đang cập nhật...' : '🔄 Cập nhật GIFs'}
            </button>
            
            <button
              onClick={clearGifCache}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              🗑️ Xóa GIF Cache
            </button>
            
            <button
              onClick={loadCacheInfo}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              📊 Refresh Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GifCacheManager; 