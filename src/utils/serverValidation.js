import axios from 'axios';
import { API_URL } from './API/apiRoutes';

/**
 * Server-side validation để prevent bypass bằng cách xóa localStorage
 */

/**
 * Check usage limits từ server
 */
export const checkServerUsageLimits = async (userId, limitType) => {
  try {
    const response = await axios.get(API_URL.CHECK_USAGE_LIMITS(userId, limitType));
    return {
      valid: response.data.allowed,
      message: response.data.message,
      usage: response.data.usage,
      limit: response.data.limit,
      unlimited: response.data.unlimited
    };
  } catch (error) {
    console.error('Error checking usage limits:', error);
    // Fallback to client-side validation if server error
    return { valid: false, message: 'Không thể kiểm tra giới hạn, vui lòng thử lại' };
  }
};

/**
 * Record usage trên server
 */
export const recordServerUsage = async (userId, limitType, planId) => {
  try {
    const response = await axios.post(API_URL.RECORD_USAGE, {
      user_id: userId,
      limit_type: limitType,
      plan_id: planId
    });
    return response.data.success;
  } catch (error) {
    console.error('Error recording usage:', error);
    return false;
  }
};

/**
 * Get user usage stats từ server
 */
export const getServerUsageStats = async (userId, userPlan = null) => {
  try {
    const planId = userPlan?.plan_id || 'free';
    const response = await axios.get(API_URL.GET_USAGE_STATS(userId), {
      params: {
        plan_id: planId // Send plan_id in query params
      }
    });

    return response.data.data; // Changed to return response.data.data
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return null;
  }
};

// New function to get caption usage stats from DB-LK-master
export const getCaptionUsageStats = async (userId, userPlan = null) => {
  try {
    const planId = userPlan?.plan_id || 'free';
    const response = await axios.get(API_URL.GET_CAPTION_USAGE_STATS(userId), {
      params: {
        plan_id: planId
      }
    });

    return response.data; // DB-LK-master returns data directly
  } catch (error) {
    console.error('Error getting caption usage stats:', error);
    return null;
  }
};

/**
 * Validate file size với server
 */
export const validateFileServerSide = async (userId, fileSize, fileType) => {
  try {
    const response = await axios.post(API_URL.VALIDATE_FILE_SIZE, {
      user_id: userId,
      file_size: fileSize,
      file_type: fileType
    });
    return {
      valid: response.data.valid,
      message: response.data.message,
      maxSize: response.data.max_size
    };
  } catch (error) {
    console.error('Error validating file size:', error);
    return { valid: false, message: 'Không thể kiểm tra kích thước file' };
  }
};

/**
 * Hybrid validation: Check both client và server
 */
export const validateWithServerBackup = async (userId, userPlan, limitType) => {
  // Always allow gif_caption
  if (limitType === 'gif_caption') {
    return { valid: true, message: 'Không giới hạn gif caption' };
  }
  
  // Thử server validation trước
  try {
    const serverResult = await checkServerUsageLimits(userId, limitType);
    if (serverResult.valid !== undefined) {
      return serverResult;
    }
  } catch (error) {
    console.warn('Server validation failed, falling back to client-side');
  }
  
  // Fallback to client-side validation
  const { validateCaptionCreation, validateGifCaptionCreation } = await import('./limitValidation');
  
  if (limitType === 'caption') {
    return validateCaptionCreation(userId, userPlan);
  }
  
  return { valid: false, message: 'Unknown limit type' };
};