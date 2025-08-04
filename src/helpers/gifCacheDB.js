// gifCacheDB.js - Helper cho cache GIF bằng IndexedDB
const DB_NAME = 'GifCacheDB';
const STORE_NAME = 'gifs';
const STORE_META = 'gif_metadata';
const DB_VERSION = 2; // Tăng version để thêm metadata store

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Tạo store cho GIF blobs
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      
      // Tạo store cho metadata (version, timestamp, etc.)
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Lưu GIF với metadata
export async function setGif(url, blob, metadata = {}) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME, STORE_META], 'readwrite');
    
    // Lưu blob
    const store = tx.objectStore(STORE_NAME);
    const blobReq = store.put(blob, url);
    
    // Lưu metadata
    const metaStore = tx.objectStore(STORE_META);
    const meta = {
      url,
      timestamp: Date.now(),
      size: blob.size,
      type: blob.type,
      version: metadata.version || '1.0',
      etag: metadata.etag || null,
      lastModified: metadata.lastModified || null,
      ...metadata
    };
    const metaReq = metaStore.put(meta, url);
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Lấy GIF từ cache
export async function getGif(url) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(url);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Lấy metadata của GIF
export async function getGifMetadata(url) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_META, 'readonly');
    const store = tx.objectStore(STORE_META);
    const req = store.get(url);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Kiểm tra xem GIF có tồn tại trong cache không
export async function hasGif(url) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getKey(url);
    req.onsuccess = () => resolve(!!req.result);
    req.onerror = () => reject(req.error);
  });
}

// Kiểm tra xem GIF có cần cập nhật không
export async function shouldUpdateGif(url, newMetadata = {}) {
  try {
    const cachedMetadata = await getGifMetadata(url);
    if (!cachedMetadata) return true; // Chưa có trong cache
    
    // So sánh ETag nếu có
    if (newMetadata.etag && cachedMetadata.etag && newMetadata.etag !== cachedMetadata.etag) {
      return true;
    }
    
    // So sánh Last-Modified nếu có
    if (newMetadata.lastModified && cachedMetadata.lastModified && 
        new Date(newMetadata.lastModified) > new Date(cachedMetadata.lastModified)) {
      return true;
    }
    
    // So sánh version nếu có
    if (newMetadata.version && cachedMetadata.version && newMetadata.version !== cachedMetadata.version) {
      return true;
    }
    
    // Kiểm tra thời gian cache (7 ngày)
    const cacheAge = Date.now() - cachedMetadata.timestamp;
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 ngày
    if (cacheAge > maxAge) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking GIF update:', error);
    return true; // Nếu lỗi, cập nhật để đảm bảo an toàn
  }
}

// Cập nhật GIF với kiểm tra thông minh
export async function updateGifIfNeeded(url, fetchOptions = {}) {
  try {
    // Kiểm tra xem có cần cập nhật không
    const needsUpdate = await shouldUpdateGif(url, fetchOptions);
    
    if (needsUpdate) {
      console.log(`Updating GIF: ${url}`);
      
      // Fetch GIF mới với headers
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Cache-Control': 'no-cache',
          ...fetchOptions.headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch GIF: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Lấy metadata từ response
      const metadata = {
        etag: response.headers.get('etag'),
        lastModified: response.headers.get('last-modified'),
        version: fetchOptions.version || '1.0',
        size: blob.size,
        type: blob.type
      };
      
      // Lưu vào cache
      await setGif(url, blob, metadata);
      
      return { updated: true, blob, metadata };
    } else {
      console.log(`GIF already up to date: ${url}`);
      const blob = await getGif(url);
      const metadata = await getGifMetadata(url);
      return { updated: false, blob, metadata };
    }
  } catch (error) {
    console.error('Error updating GIF:', error);
    // Fallback: lấy từ cache nếu có
    try {
      const blob = await getGif(url);
      return { updated: false, blob, error };
    } catch (cacheError) {
      throw error;
    }
  }
}

// Xóa tất cả GIF cache
export async function clearAllGifs() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME, STORE_META], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const metaStore = tx.objectStore(STORE_META);
    
    const clearReq = store.clear();
    const clearMetaReq = metaStore.clear();
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Xóa GIF cụ thể
export async function removeGif(url) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME, STORE_META], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const metaStore = tx.objectStore(STORE_META);
    
    const deleteReq = store.delete(url);
    const deleteMetaReq = metaStore.delete(url);
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Lấy thông tin cache
export async function getCacheInfo() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME, STORE_META], 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const metaStore = tx.objectStore(STORE_META);
    
    const countReq = store.count();
    const metaCountReq = metaStore.count();
    
    tx.oncomplete = () => {
      resolve({
        gifCount: countReq.result,
        metaCount: metaCountReq.result
      });
    };
    tx.onerror = () => reject(tx.error);
  });
}

export default { 
  setGif, 
  getGif, 
  hasGif, 
  clearAllGifs,
  getGifMetadata,
  shouldUpdateGif,
  updateGifIfNeeded,
  removeGif,
  getCacheInfo
}; 