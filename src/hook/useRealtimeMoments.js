import { useEffect } from "react";
import { onNewMoments, onMomentDeleted, emitGetMoments, onConnect, getSocket } from "../lib/socket";
import { transformServerMoment } from "../utils/standardize/transformMoment";

/**
 * Hook lắng nghe realtime moments từ socket
 * @param {Object} params
 * @param {string} params.selectedFriendUid UID của friend đang xem (hoặc null nếu xem all)
 * @param {Function} params.setServerMoments Setter update state moments
 */
export const useRealtimeMoments = ({ selectedFriendUid, setServerMoments, token }) => {
    useEffect(() => {
        if (!token) return;

        const handleNewMoments = (data) => {
            console.log("DEBUG [Client]: Received new_on_moments", data);
            if (!data) return;

            const items = Array.isArray(data) ? data : [data];
            if (items.length === 0) return;

            const mapped = items.map(transformServerMoment);

            setServerMoments((prev) => {
                const next = [...prev];
                mapped.forEach((m) => {
                    const index = next.findIndex((existing) => existing.id === m.id);
                    if (index > -1) {
                        next[index] = { ...next[index], ...m };
                    } else {
                        next.unshift(m);
                    }
                });

                // Sắp xếp theo ngày giảm dần
                return next.sort((a, b) => new Date(b.date) - new Date(a.date));
            });
        };

        const handleMomentDeleted = (data) => {
            console.log("DEBUG [Client]: Received moment_deleted", data);
            if (!data?.id) return;

            setServerMoments((prev) => {
                return prev.filter((m) => m.id !== data.id);
            });
        };

        const emitData = () => {
            console.log("DEBUG [Client]: Emitting get_moments", {
                friendId: selectedFriendUid || null,
            });
            emitGetMoments({
                token,
                friendId: selectedFriendUid || null,
                limit: 5,
            });
        };

        const cleanup = onNewMoments(handleNewMoments);
        const cleanupDeleted = onMomentDeleted(handleMomentDeleted);
        const cleanupConnect = onConnect(emitData);

        // Emit ngay lập tức nếu socket đã connected
        if (getSocket().connected) {
            emitData();
        }

        return () => {
            cleanup();
            cleanupDeleted();
            cleanupConnect();
        };
    }, [selectedFriendUid, setServerMoments, token]); // Re-emit if friend changes
};
