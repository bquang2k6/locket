import { plans } from './plans';

// Key prefix cho localStorage
const USAGE_PREFIX = 'daily_usage_';
const LAST_RESET_KEY = 'last_usage_reset';

/**
 * Get current date in YYYY-MM-DD format for tracking daily usage
 */
const getCurrentDateKey = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Reset daily usage if it's a new day
 */
const resetDailyUsageIfNeeded = () => {
  const today = getCurrentDateKey();
  const lastReset = localStorage.getItem(LAST_RESET_KEY);
  
  if (lastReset !== today) {
    // New day, reset all daily counters
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(USAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    localStorage.setItem(LAST_RESET_KEY, today);
  }
};

/**
 * Get current daily usage for a specific type với enhanced checking
 */
const getDailyUsage = (userId, type) => {
  resetDailyUsageIfNeeded();
  const today = getCurrentDateKey();
  
  // Check multiple sources và lấy giá trị cao nhất
  const keys = [
    `${USAGE_PREFIX}${userId}_${type}_${today}`,
    `backup_${userId}_${type}_${today}`,
    `count_${type}_${userId}`,
    `daily_${today}_${type}_${userId}`
  ];
  
  let maxUsage = 0;
  keys.forEach(key => {
    const localValue = parseInt(localStorage.getItem(key) || '0');
    const sessionValue = parseInt(sessionStorage.getItem(key) || '0');
    maxUsage = Math.max(maxUsage, localValue, sessionValue);
  });
  
  return maxUsage;
};

/**
 * Increment daily usage for a specific type với enhanced security
 */
const incrementDailyUsage = (userId, type) => {
  resetDailyUsageIfNeeded();
  const today = getCurrentDateKey();
  const current = getDailyUsage(userId, type);
  
  // Lưu ở nhiều key để khó xóa hơn
  const keys = [
    `${USAGE_PREFIX}${userId}_${type}_${today}`,
    `backup_${userId}_${type}_${today}`,
    `count_${type}_${userId}`,
    `daily_${today}_${type}_${userId}`
  ];
  
  keys.forEach(key => {
    localStorage.setItem(key, (current + 1).toString());
    // Cũng backup trong sessionStorage
    sessionStorage.setItem(key, (current + 1).toString());
  });
  
  // Log activity để detect suspicious behavior
  const activityLog = JSON.parse(localStorage.getItem('usage_activity') || '[]');
  activityLog.push({
    userId,
    type,
    timestamp: Date.now(),
    userAgent: navigator.userAgent.substring(0, 50)
  });
  
  // Keep only last 50 activities
  if (activityLog.length > 50) {
    activityLog.splice(0, activityLog.length - 50);
  }
  
  localStorage.setItem('usage_activity', JSON.stringify(activityLog));
};

/**
 * Get plan details by plan ID
 */
const getPlanDetails = (planId) => {
  return plans.find(plan => plan.id === planId) || plans[0]; // Default to free plan
};

/**
 * Extract daily limits from plan perks
 */
const extractDailyLimits = (planPerks) => {
  const limits = {
    captionDaily: 0,
    gifCaptionDaily: 0  // Always unlimited
  };

  Object.keys(planPerks).forEach(perk => {
    // Extract caption daily limit
    if (perk.includes('caption') && perk.includes('lần') && perk.includes('ngày')) {
      const match = perk.match(/(\d+)\s*lần/);
      if (match && !perk.includes('gif')) {
        limits.captionDaily = parseInt(match[1]);
      }
    }
  });

  return limits;
};

/**
 * Validate file size against plan limits
 */
export const validateFileSize = (file, userPlan) => {
  if (!file || !userPlan) {
    return { valid: false, message: 'File hoặc plan không hợp lệ' };
  }

  const planDetails = getPlanDetails(userPlan.plan_id || 'free');
  const fileSizeInMB = file.size / (1024 * 1024);
  
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  
  if (isImage) {
    const maxSize = planDetails.max_image_size;
    if (fileSizeInMB > maxSize) {
      return {
        valid: false,
        message: `Ảnh vượt quá giới hạn ${maxSize}MB của gói ${planDetails.name}. Kích thước hiện tại: ${fileSizeInMB.toFixed(2)}MB`
      };
    }
  } else if (isVideo) {
    const maxSize = planDetails.max_video_size;
    if (fileSizeInMB > maxSize) {
      return {
        valid: false,
        message: `Video vượt quá giới hạn ${maxSize}MB của gói ${planDetails.name}. Kích thước hiện tại: ${fileSizeInMB.toFixed(2)}MB`
      };
    }
  } else {
    return { valid: false, message: 'Định dạng file không được hỗ trợ' };
  }

  return { valid: true, message: 'File hợp lệ' };
};

/**
 * Validate caption creation against daily limits
 */
export const validateCaptionCreation = (userId, userPlan) => {
  if (!userId || !userPlan) {
    return { valid: false, message: 'User ID hoặc plan không hợp lệ' };
  }

  const planDetails = getPlanDetails(userPlan.plan_id || 'free');
  const limits = extractDailyLimits(planDetails.perks);
  
  if (limits.captionDaily === 0) {
    return { valid: false, message: 'Gói của bạn không hỗ trợ tạo caption' };
  }
  
  if (limits.captionDaily === Infinity) {
    return { valid: true, message: 'Không giới hạn caption' };
  }

  const currentUsage = getDailyUsage(userId, 'caption');
  
  if (currentUsage >= limits.captionDaily) {
    return {
      valid: false,
      message: `Bạn đã đạt giới hạn ${limits.captionDaily} caption/ngày của gói ${planDetails.name}. Còn lại: 0`
    };
  }

  return {
    valid: true,
    message: `Còn lại ${limits.captionDaily - currentUsage}/${limits.captionDaily} caption hôm nay`
  };
};

/**
 * Validate gif caption creation against daily limits
 */
export const validateGifCaptionCreation = (userId, userPlan) => {
  // Always allow gif caption (no limits)
  return { valid: true, message: 'Không giới hạn gif caption' };
};

/**
 * Record successful caption creation
 */
export const recordCaptionUsage = (userId) => {
  if (!userId) return;
  incrementDailyUsage(userId, 'caption');
};

/**
 * Record successful gif caption creation
 */
export const recordGifCaptionUsage = (userId) => {
  // No need to record gif caption usage (unlimited)
  return;
};

/**
 * Get current usage stats for display
 */
export const getUserUsageStats = (userId, userPlan) => {
  if (!userId || !userPlan) return null;

  const planDetails = getPlanDetails(userPlan.plan_id || 'free');
  const limits = extractDailyLimits(planDetails.perks);
  
  return {
    caption: {
      used: getDailyUsage(userId, 'caption'),
      limit: limits.captionDaily,
      unlimited: limits.captionDaily === Infinity
    },
    gifCaption: {
      used: getDailyUsage(userId, 'gif_caption'),
      limit: limits.gifCaptionDaily,
      unlimited: limits.gifCaptionDaily === Infinity
    },
    fileSize: {
      maxImageSize: planDetails.max_image_size,
      maxVideoSize: planDetails.max_video_size
    }
  };
};

/**
 * Check if user has any feature available
 */
export const checkFeatureAvailability = (userPlan, feature) => {
  if (!userPlan) return false;
  
  const planDetails = getPlanDetails(userPlan.plan_id || 'free');
  return planDetails.features[feature] || false;
};

/**
 * Detect suspicious activity (multiple cache clears)
 */
export const detectSuspiciousActivity = (userId) => {
  const activityLog = JSON.parse(localStorage.getItem('usage_activity') || '[]');
  const recentActivity = activityLog.filter(log => 
    log.userId === userId && 
    Date.now() - log.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
  );
  
  // Check for signs of cache clearing
  const suspiciousPatterns = {
    tooManyActivities: recentActivity.length > 20,
    rapidSuccession: recentActivity.some((log, index) => {
      const nextLog = recentActivity[index + 1];
      return nextLog && (nextLog.timestamp - log.timestamp) < 60000; // Less than 1 minute apart
    }),
    differentUserAgents: new Set(recentActivity.map(log => log.userAgent)).size > 2
  };
  
  return Object.values(suspiciousPatterns).some(Boolean);
};

/**
 * Enhanced validation với suspicious activity detection
 */
export const validateWithSecurityCheck = (userId, userPlan, limitType) => {
  // Always allow gif_caption
  if (limitType === 'gif_caption') {
    return { valid: true, message: 'Không giới hạn gif caption' };
  }
  
  // Check for suspicious activity first
  if (detectSuspiciousActivity(userId)) {
    return {
      valid: false,
      message: '⚠️ Phát hiện hoạt động bất thường. Để bảo mật, vui lòng liên hệ hỗ trợ hoặc thử lại sau 1 giờ.'
    };
  }
  
  // Proceed with normal validation
  if (limitType === 'caption') {
    return validateCaptionCreation(userId, userPlan);
  }
  
  return { valid: false, message: 'Unknown limit type' };
};
