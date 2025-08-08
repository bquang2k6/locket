// Utility để quản lý việc giới hạn đăng nhập theo từng email
const LOGIN_ATTEMPTS_PREFIX = 'loginAttempts_';
const LOGIN_LOCKOUT_PREFIX = 'loginLockout_';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 phút tính bằng milliseconds

/**
 * Tạo key cho localStorage dựa trên email
 * @param {string} email - Email của người dùng
 * @returns {string} Key cho localStorage
 */
const getAttemptsKey = (email) => `${LOGIN_ATTEMPTS_PREFIX}${email.toLowerCase()}`;
const getLockoutKey = (email) => `${LOGIN_LOCKOUT_PREFIX}${email.toLowerCase()}`;

/**
 * Lấy thông tin số lần đăng nhập thất bại cho email cụ thể
 * @param {string} email - Email của người dùng
 * @returns {Object} { attempts: number, lockoutUntil: number | null }
 */
export const getLoginAttempts = (email) => {
  try {
    if (!email) return { attempts: 0, lockoutUntil: null };
    
    const attemptsKey = getAttemptsKey(email);
    const lockoutKey = getLockoutKey(email);
    
    const attempts = parseInt(localStorage.getItem(attemptsKey) || '0');
    const lockoutUntil = localStorage.getItem(lockoutKey);
    
    return {
      attempts,
      lockoutUntil: lockoutUntil ? parseInt(lockoutUntil) : null
    };
  } catch (error) {
    console.error('Lỗi khi đọc thông tin đăng nhập:', error);
    return { attempts: 0, lockoutUntil: null };
  }
};

/**
 * Tăng số lần đăng nhập thất bại cho email cụ thể
 * @param {string} email - Email của người dùng
 * @returns {Object} { attempts: number, isLocked: boolean, remainingTime: number }
 */
export const incrementLoginAttempts = (email) => {
  try {
    if (!email) return { attempts: 0, isLocked: false, remainingTime: 0 };
    
    const { attempts, lockoutUntil } = getLoginAttempts(email);
    const now = Date.now();
    
    // Kiểm tra xem có đang bị khóa không
    if (lockoutUntil && now < lockoutUntil) {
      const remainingTime = Math.ceil((lockoutUntil - now) / 1000 / 60); // Phút
      return {
        attempts: attempts,
        isLocked: true,
        remainingTime
      };
    }
    
    // Reset nếu đã hết thời gian khóa
    if (lockoutUntil && now >= lockoutUntil) {
      resetLoginAttempts(email);
    }
    
    const newAttempts = attempts + 1;
    const attemptsKey = getAttemptsKey(email);
    localStorage.setItem(attemptsKey, newAttempts.toString());
    
    // Nếu đạt giới hạn, bắt đầu khóa
    if (newAttempts >= MAX_ATTEMPTS) {
      const lockoutUntil = now + LOCKOUT_DURATION;
      const lockoutKey = getLockoutKey(email);
      localStorage.setItem(lockoutKey, lockoutUntil.toString());
      
      return {
        attempts: newAttempts,
        isLocked: true,
        remainingTime: 15 // 15 phút
      };
    }
    
    return {
      attempts: newAttempts,
      isLocked: false,
      remainingTime: 0
    };
  } catch (error) {
    console.error('Lỗi khi cập nhật số lần đăng nhập:', error);
    return { attempts: 0, isLocked: false, remainingTime: 0 };
  }
};

/**
 * Reset số lần đăng nhập thất bại cho email cụ thể (khi đăng nhập thành công)
 * @param {string} email - Email của người dùng
 */
export const resetLoginAttempts = (email) => {
  try {
    if (!email) return;
    
    const attemptsKey = getAttemptsKey(email);
    const lockoutKey = getLockoutKey(email);
    
    localStorage.removeItem(attemptsKey);
    localStorage.removeItem(lockoutKey);
  } catch (error) {
    console.error('Lỗi khi reset số lần đăng nhập:', error);
  }
};

/**
 * Kiểm tra xem email có đang bị khóa đăng nhập không
 * @param {string} email - Email của người dùng
 * @returns {Object} { isLocked: boolean, remainingTime: number }
 */
export const checkLoginLockout = (email) => {
  try {
    if (!email) return { isLocked: false, remainingTime: 0 };
    
    const { attempts, lockoutUntil } = getLoginAttempts(email);
    const now = Date.now();
    
    if (lockoutUntil && now < lockoutUntil) {
      const remainingTime = Math.ceil((lockoutUntil - now) / 1000 / 60); // Phút
      return {
        isLocked: true,
        remainingTime
      };
    }
    
    // Reset nếu đã hết thời gian khóa
    if (lockoutUntil && now >= lockoutUntil) {
      resetLoginAttempts(email);
    }
    
    return {
      isLocked: false,
      remainingTime: 0
    };
  } catch (error) {
    console.error('Lỗi khi kiểm tra khóa đăng nhập:', error);
    return { isLocked: false, remainingTime: 0 };
  }
};

/**
 * Lấy thông tin hiển thị cho người dùng theo email
 * @param {string} email - Email của người dùng
 * @returns {Object} { attempts: number, remainingAttempts: number, isLocked: boolean, remainingTime: number }
 */
export const getLoginAttemptsInfo = (email) => {
  if (!email) return { attempts: 0, remainingAttempts: 4, isLocked: false, remainingTime: 0 };
  
  const { attempts, lockoutUntil } = getLoginAttempts(email);
  const { isLocked, remainingTime } = checkLoginLockout(email);
  
  return {
    attempts,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - attempts),
    isLocked,
    remainingTime
  };
};

/**
 * Xóa tất cả dữ liệu khóa đăng nhập (cho mục đích debug)
 */
export const clearAllLoginAttempts = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(LOGIN_ATTEMPTS_PREFIX) || key.startsWith(LOGIN_LOCKOUT_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('✅ Đã xóa tất cả dữ liệu khóa đăng nhập');
  } catch (error) {
    console.error('Lỗi khi xóa dữ liệu khóa đăng nhập:', error);
  }
};
