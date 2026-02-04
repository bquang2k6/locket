import React, { useState, useEffect, useContext } from 'react';
import {
    subscribeToPushNotifications,
    getSubscriptionStatus,
    unsubscribeFromPushNotifications
} from '../services/serviceWorker/pushSubscription';
import { AuthContext } from '../context/AuthLocket';

const PushNotificationManager = () => {
    const [status, setStatus] = useState('loading'); // loading, subscribed, unsubscribed, blocked, unsupported
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        checkStatus();

        // Cập nhật trạng thái khi người dùng quay lại tab (ví dụ: sau khi bật quyền trong cài đặt trình duyệt)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkStatus();
            }
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const checkStatus = async () => {
        const currentStatus = await getSubscriptionStatus();
        setStatus(prevStatus => {
            if (prevStatus !== currentStatus) {
                return currentStatus;
            }
            return prevStatus;
        });
    };

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            await subscribeToPushNotifications({
                uid: user?.localId,
                email: user?.email,
                username: user?.username,
                displayName: user?.displayName || user?.display_name
            });
            setStatus('subscribed');
            alert('Đã bật thông báo thành công!');
        } catch (error) {
            alert('Không thể bật thông báo: ' + error.message);
            checkStatus();
        } finally {
            setLoading(false);
        }
    };

    const handleUnsubscribe = async () => {
        setLoading(true);
        try {
            await unsubscribeFromPushNotifications();
            setStatus('unsubscribed');
            alert('Đã tắt thông báo.');
        } catch (error) {
            alert('Lỗi: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'unsupported') return null;

    return (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${status === 'subscribed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white">Thông báo đẩy</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {status === 'subscribed'
                                ? 'Bạn đang nhận được thông báo từ hệ thống.'
                                : status === 'blocked'
                                    ? 'Hãy bật quyền thông báo trong cài đặt trình duyệt.'
                                    : 'Nhận thông báo khi có tin nhắn hoặc hoạt động mới.'}
                        </p>
                    </div>
                </div>

                {status === 'subscribed' ? (
                    <button
                        onClick={handleUnsubscribe}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                    >
                        Tắt
                    </button>
                ) : (
                    <button
                        onClick={handleSubscribe}
                        disabled={loading || status === 'blocked'}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-lg ${status === 'blocked' ? 'bg-zinc-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {loading ? 'Đang bật...' : 'Bật ngay'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default PushNotificationManager;
