import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { clearAllGifs, getCacheInfo } from '../../../helpers/gifCacheDB';
import { forceUpdate, clearAllCache } from '../../../services/serviceWorker/serviceWorkerRegistration';

const CacheManagement = () => {
  const [cacheInfo, setCacheInfo] = useState({
    serviceWorker: false,
    cacheStorage: 0,
    localStorage: 0,
    sessionStorage: 0,
    gifCacheDB: 'Unknown',
    gifCount: 0,
    metaCount: 0
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    loadCacheInfo();
  }, []);

  const loadCacheInfo = async () => {
    try {
      // Service Worker info
      let serviceWorker = false;
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        serviceWorker = !!registration.active;
      }

      // Cache Storage info
      let cacheStorage = 0;
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        cacheStorage = cacheNames.length;
      }

      // LocalStorage info
      const localStorage = Object.keys(localStorage).length;
      const sessionStorage = Object.keys(sessionStorage).length;

      // GifCacheDB info
      let gifCacheDB = 'Not available';
      let gifCount = 0;
      let metaCount = 0;
      try {
        const gifInfo = await getCacheInfo();
        gifCacheDB = 'Available';
        gifCount = gifInfo.gifCount;
        metaCount = gifInfo.metaCount;
      } catch (e) {
        gifCacheDB = 'Not available';
      }

      setCacheInfo({
        serviceWorker,
        cacheStorage,
        localStorage,
        sessionStorage,
        gifCacheDB,
        gifCount,
        metaCount
      });
    } catch (error) {
      console.error('Error loading cache info:', error);
      toast.error('Không thể tải thông tin cache!');
    }
  };

  const handleForceUpdate = async () => {
    setIsUpdating(true);
    try {
      await forceUpdate();
      toast.success('Đã force update service worker!');
      setTimeout(() => {
        window.location.reload(true);
      }, 1000);
    } catch (error) {
      console.error('Force update failed:', error);
      toast.error('Force update thất bại!');
      setIsUpdating(false);
    }
  };

  const handleClearAllCache = async () => {
    setIsClearing(true);
    try {
      // Clear browser cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Clear service worker cache
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          registration.active.postMessage({ type: 'CLEAR_CACHE' });
        }
      }

      // Clear localStorage và sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      // Clear gifCacheDB
      await clearAllGifs();

      toast.success('Đã xóa tất cả cache thành công!');
      
      // Reload trang
      setTimeout(() => {
        window.location.reload(true);
      }, 1000);
    } catch (error) {
      console.error('Clear cache failed:', error);
      toast.error('Xóa cache thất bại!');
      setIsClearing(false);
    }
  };

  const handleHardRefresh = () => {
    // Force reload với cache bypass
    window.location.reload(true);
  };

  const handleClearGifCache = async () => {
    try {
      await clearAllGifs();
      await loadCacheInfo();
      toast.success('Đã xóa GIF cache thành công!');
    } catch (error) {
      console.error('Error clearing GIF cache:', error);
      toast.error('Xóa GIF cache thất bại!');
    }
  };

  const handleClearBrowserCache = async () => {
    try {
      // Clear browser cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Clear localStorage và sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      await loadCacheInfo();
      toast.success('Đã xóa browser cache thành công!');
    } catch (error) {
      console.error('Error clearing browser cache:', error);
      toast.error('Xóa browser cache thất bại!');
    }
  };

  const handleUnregisterServiceWorker = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.unregister();
          toast.success('Đã unregister service worker!');
          setTimeout(() => {
            window.location.reload(true);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error unregistering service worker:', error);
      toast.error('Unregister service worker thất bại!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 mt-10">
            🛠️ Cache Management
          </h1>
          <p className="text-gray-600">
            Quản lý cache và debug cho website
          </p>
        </div>

        {/* Cache Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">📊 Cache Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Service Worker</h3>
              <p className={`text-lg ${cacheInfo.serviceWorker ? 'text-green-600' : 'text-red-600'}`}>
                {cacheInfo.serviceWorker ? '✅ Active' : '❌ Inactive'}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Cache Storage</h3>
              <p className="text-lg text-green-600">{cacheInfo.cacheStorage} caches</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Local Storage</h3>
              <p className="text-lg text-purple-600">{cacheInfo.localStorage} items</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800">Session Storage</h3>
              <p className="text-lg text-orange-600">{cacheInfo.sessionStorage} items</p>
            </div>
            
            <div className="bg-pink-50 p-4 rounded-lg">
              <h3 className="font-semibold text-pink-800">GIF Cache DB</h3>
              <p className="text-lg text-pink-600">{cacheInfo.gifCacheDB}</p>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-semibold text-indigo-800">Cached GIFs</h3>
              <p className="text-lg text-indigo-600">{cacheInfo.gifCount} GIFs</p>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <button
              onClick={loadCacheInfo}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🔄 Refresh Info
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Update Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">🔄 Update Actions</h2>
            <div className="space-y-3">
              <button
                onClick={handleForceUpdate}
                disabled={isUpdating}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? '⏳ Đang cập nhật...' : '🚀 Force Update Service Worker'}
              </button>
              
              <button
                onClick={handleHardRefresh}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-colors"
              >
                🔄 Hard Refresh Page
              </button>
            </div>
          </div>

          {/* Clear Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-red-800">🗑️ Clear Actions</h2>
            <div className="space-y-3">
              <button
                onClick={handleClearAllCache}
                disabled={isClearing}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClearing ? '⏳ Đang xóa...' : '💥 Clear All Cache'}
              </button>
              
              <button
                onClick={handleClearGifCache}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg transition-colors"
              >
                🎨 Clear GIF Cache
              </button>
              
              <button
                onClick={handleClearBrowserCache}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg transition-colors"
              >
                🌐 Clear Browser Cache
              </button>
              
              <button
                onClick={handleUnregisterServiceWorker}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
              >
                🚫 Unregister Service Worker
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">📋 Instructions</h2>
          <div className="space-y-3 text-gray-600">
            <div className="flex items-start space-x-2">
              <span className="text-blue-500">1.</span>
              <p><strong>Force Update:</strong> Cập nhật service worker và reload trang</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500">2.</span>
              <p><strong>Hard Refresh:</strong> Reload trang với cache bypass</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-red-500">3.</span>
              <p><strong>Clear All Cache:</strong> Xóa tất cả cache và reload</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-orange-500">4.</span>
              <p><strong>Clear GIF Cache:</strong> Chỉ xóa cache GIF</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-purple-500">5.</span>
              <p><strong>Clear Browser Cache:</strong> Xóa cache browser</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-gray-500">6.</span>
              <p><strong>Unregister Service Worker:</strong> Gỡ bỏ service worker</p>
            </div>
          </div>
        </div>

        {/* Debug Info
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">🐛 Debug Information</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm text-gray-700 overflow-x-auto">
              {JSON.stringify(cacheInfo, null, 2)}
            </pre>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default CacheManagement; 