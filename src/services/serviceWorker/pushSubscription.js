import axios from "axios";
import { API_URL } from "../../utils/API/apiRoutes";

/**
 * Chuyển đổi VAPID public key từ Base64 sang Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

/**
 * Chuyển đổi ArrayBuffer sang Base64
 */
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}


/**
 * Biến toàn cục để khóa (lock) các yêu cầu đăng ký đang xử lý,
 * tránh việc gửi nhiều yêu cầu cùng lúc (ví dụ do React Strict Mode).
 */
let subscriptionPromise = null;

/**
 * Đăng ký push notification
 * @param {string} userId - ID người dùng (không bắt buộc)
 */
/**
 * Đăng ký push notification
 * @param {Object} userInfo - Thông tin người dùng (email, uid, username, displayName)
 */
export async function subscribeToPushNotifications(userInfo = {}) {
    // Nếu đang có một yêu cầu đang xử lý, trả về promise đó luôn
    if (subscriptionPromise) {
        console.log('Push subscription is already in progress, reusing existing promise...');
        return subscriptionPromise;
    }

    subscriptionPromise = (async () => {
        try {
            // 1. Kiểm tra hỗ trợ Service Worker và PushManager
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                throw new Error('Trình duyệt không hỗ trợ Push Notifications.');
            }

            // 2. Chờ Service Worker sẵn sàng
            const registration = await navigator.serviceWorker.ready;

            // Kiểm tra xem đã có subscription chưa để tránh đăng ký lại không cần thiết
            const existingSub = await registration.pushManager.getSubscription();

            let rawSub = existingSub;
            if (!existingSub) {
                // 3. Lấy VAPID Public Key từ Backend
                const response = await axios.get(API_URL.VAPID_PUBLIC_KEY);
                const { publicKey, success } = response.data;

                if (!success) {
                    throw new Error('Không thể lấy VAPID public key từ server.');
                }

                // 4. Đăng ký với Push Manager của trình duyệt
                rawSub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey)
                });
            }

            const subscription = {
                endpoint: rawSub.endpoint,
                keys: {
                    p256dh: arrayBufferToBase64(rawSub.getKey('p256dh')),
                    auth: arrayBufferToBase64(rawSub.getKey('auth'))
                }
            };

            // Trích xuất thông tin user
            const { email, uid, username, displayName } = userInfo;

            // 5. Gửi subscription object lên Backend để lưu vào MongoDB
            const saveResponse = await axios.post(API_URL.SUBSCRIBE, {
                subscription,
                // userId: uid ?? null, // Backward compatibility if needed, but we use explicit fields now
                uid: uid ?? null,
                email: email ?? null,
                username: username ?? null,
                displayName: displayName ?? null,
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    browser: getBrowserName()
                }
            });

            return saveResponse.data;

        } catch (error) {
            console.error('Lỗi khi đăng ký Push Notification:', error);
            throw error;
        } finally {
            // Reset promise sau khi xong (thành công hoặc lỗi) để cho phép lần đăng ký sau
            subscriptionPromise = null;
        }
    })();

    return subscriptionPromise;
}

/**
 * Kiểm tra trạng thái đăng ký hiện tại
 */
export async function getSubscriptionStatus() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return 'unsupported';
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
        return 'subscribed';
    }

    const permission = Notification.permission;
    if (permission === 'denied') {
        return 'blocked';
    }

    return 'unsubscribed';
}

/**
 * Hủy đăng ký push notification
 */
export async function unsubscribeFromPushNotifications() {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            // 1. Thông báo cho backend xóa subscription
            await axios.post(API_URL.UNSUBSCRIBE, {
                endpoint: subscription.endpoint
            });

            // 2. Hủy đăng ký phía trình duyệt
            await subscription.unsubscribe();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Lỗi khi hủy đăng ký Push Notification:', error);
        throw error;
    }
}

function getBrowserName() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("SamsungBrowser")) return "Samsung Browser";
    if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera";
    if (userAgent.includes("Edge")) return "Edge";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Safari")) return "Safari";
    return "Unknown";
}
