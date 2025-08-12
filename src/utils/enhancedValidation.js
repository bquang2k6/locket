/**
 * Enhanced client-side validation với device fingerprinting
 * Khó bypass hơn nhưng vẫn không 100% secure
 */

/**
 * Tạo device fingerprint để identify user uniquely
 */
const generateDeviceFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('Device fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    navigator.hardwareConcurrency || '',
    navigator.deviceMemory || ''
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
};

/**
 * Lưu usage data với multiple keys để khó xóa hơn
 */
const setSecureUsage = (userId, type, value) => {
  const today = new Date().toISOString().split('T')[0];
  const deviceId = generateDeviceFingerprint();
  
  // Lưu ở nhiều nơi
  const keys = [
    `usage_${userId}_${type}_${today}`,
    `${deviceId}_${type}_${today}`,
    `daily_${type}_${userId}`,
    `limit_${type}_${deviceId}_${today}`
  ];
  
  keys.forEach(key => {
    localStorage.setItem(key, value.toString());
    // Cũng lưu trong sessionStorage
    sessionStorage.setItem(key, value.toString());
  });
  
  // Lưu backup trong IndexedDB nếu có thể
  try {
    if ('indexedDB' in window) {
      const request = indexedDB.open('UsageDB', 1);
      request.onsuccess = (event) => {
        const db = event.target.result;
        if (db.objectStoreNames.contains('usage')) {
          const transaction = db.transaction(['usage'], 'readwrite');
          const store = transaction.objectStore('usage');
          store.put({ key: `${userId}_${type}_${today}`, value, timestamp: Date.now() });
        }
      };
    }
  } catch (e) {
    console.warn('IndexedDB not available');
  }
};

/**
 * Đọc usage data từ multiple sources
 */
const getSecureUsage = (userId, type) => {
  const today = new Date().toISOString().split('T')[0];
  const deviceId = generateDeviceFingerprint();
  
  const keys = [
    `usage_${userId}_${type}_${today}`,
    `${deviceId}_${type}_${today}`,
    `daily_${type}_${userId}`,
    `limit_${type}_${deviceId}_${today}`
  ];
  
  // Lấy giá trị cao nhất từ các sources
  let maxUsage = 0;
  
  keys.forEach(key => {
    const localStorageValue = parseInt(localStorage.getItem(key) || '0');
    const sessionValue = parseInt(sessionStorage.getItem(key) || '0');
    maxUsage = Math.max(maxUsage, localStorageValue, sessionValue);
  });
  
  return maxUsage;
};

/**
 * Enhanced validation với multiple checks
 */
export const enhancedValidateUsage = (userId, userPlan, limitType) => {
  // Always allow gif_caption
  if (limitType === 'gif_caption') {
    return { valid: true, message: 'Không giới hạn' };
  }
  
  const { plans } = require('./plans');
  const planDetails = plans.find(plan => plan.id === (userPlan.plan_id || 'free')) || plans[0];
  
  // Extract limits
  let dailyLimit = 0;
  if (limitType === 'caption') {
    const captionPerk = Object.keys(planDetails.perks).find(perk => 
      perk.includes('caption') && perk.includes('lần') && perk.includes('ngày') && !perk.includes('gif')
    );
    if (captionPerk) {
      const match = captionPerk.match(/(\d+)\s*lần/);
      dailyLimit = match ? parseInt(match[1]) : 0;
    }
  }
  
  if (dailyLimit === Infinity) {
    return { valid: true, message: 'Không giới hạn' };
  }
  
  const currentUsage = getSecureUsage(userId, limitType);
  
  if (currentUsage >= dailyLimit) {
    return {
      valid: false,
      message: `Bạn đã đạt giới hạn ${dailyLimit} ${limitType}/ngày của gói ${planDetails.name}. Để tiếp tục sử dụng, vui lòng nâng cấp gói hoặc chờ đến ngày mai.`
    };
  }
  
  return {
    valid: true,
    message: `Còn lại ${dailyLimit - currentUsage}/${dailyLimit} ${limitType} hôm nay`
  };
};

/**
 * Record usage với enhanced security
 */
export const enhancedRecordUsage = (userId, limitType) => {
  const currentUsage = getSecureUsage(userId, limitType);
  setSecureUsage(userId, limitType, currentUsage + 1);
  
  // Log activity để detect suspicious behavior
  const activityLog = JSON.parse(localStorage.getItem('activity_log') || '[]');
  activityLog.push({
    userId,
    action: limitType,
    timestamp: Date.now(),
    deviceId: generateDeviceFingerprint()
  });
  
  // Keep only last 100 activities
  if (activityLog.length > 100) {
    activityLog.splice(0, activityLog.length - 100);
  }
  
  localStorage.setItem('activity_log', JSON.stringify(activityLog));
};
