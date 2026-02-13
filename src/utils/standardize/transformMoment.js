/**
 * Chuẩn hoá dữ liệu moment từ server (mới) để hiển thị lên UI
 * @param {Object} m Dữ liệu moment thô từ server
 * @returns {Object} Moment đã chuẩn hoá
 */
export const transformServerMoment = (m) => {
    if (!m) return null;

    // Server có thể trả về m.overlays là object đơn hoặc array
    const overlays = Array.isArray(m.overlays) ? m.overlays : (m.overlays ? [m.overlays] : []);

    // Tìm overlay chính (thường là cái có text hoặc có icon)
    const mainOverlay = overlays.find(o => o.text || o.icon) || overlays[0];
    const captionText = mainOverlay?.text || m.caption || "";

    // Xử lý logic Icon: Ưu tiên icon từ server, nếu không có mới fallback về text/type
    let iconObj = null;
    if (mainOverlay?.icon) {
        iconObj = {
            type: mainOverlay.icon.type || "image",
            data: mainOverlay.icon.data || "", // Link ảnh icon (ví dụ: gold_on_black_outline.webp)
            source: mainOverlay.icon.source || "url"
        };
    } else if (mainOverlay?.type) {
        // Fallback cũ nếu không có object icon riêng biệt
        iconObj = {
            type: mainOverlay.type,
            data: mainOverlay.text,
            color: mainOverlay?.textColor || "#fff"
        };
    }

    const captionItem = captionText || iconObj
        ? {
            caption: captionText,
            text: captionText,
            text_color: mainOverlay?.textColor || "#FFFFFFE6",
            background: {
                colors: mainOverlay?.background?.colors || [],
                materialBlur: mainOverlay?.background?.materialBlur || "ultra_thin"
            },
            icon: iconObj, // Gán icon đã chuẩn hoá vào đây
            type: mainOverlay?.type || "caption",
            id: mainOverlay?.id || "default_id"
        }
        : null;

    return {
        _origin: "server",
        id: m.id,
        user: m.user,
        image_url: m.thumbnailUrl || null,
        thumbnail_url: m.thumbnailUrl || null,
        video_url: m.videoUrl || null,
        date: (() => {
            const rawDate = m.date || m.createTime;
            if (rawDate && typeof rawDate === 'object') {
                const secs = rawDate._seconds || rawDate.seconds;
                if (secs) return new Date(secs * 1000).toISOString();
            }
            if (rawDate && !isNaN(new Date(rawDate).getTime())) {
                // Nếu là timestamp dạng số (ms), chuyển về ISO
                return typeof rawDate === 'number' ? new Date(rawDate).toISOString() : rawDate;
            }
            return new Date().toISOString();
        })(),
        md5: m.md5 || null,
        captions: captionItem ? [captionItem] : [],
        music: overlays.find(o => o.music)?.music || null,
    };
};