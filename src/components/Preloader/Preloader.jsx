import { useEffect, useState } from "react";
import "./Preloader.css";

const Preloader = () => {
    const [isFading, setIsFading] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        // Thời gian chờ ban đầu trước khi bắt đầu hiệu ứng fade out
        const timer = setTimeout(() => {
            setIsFading(true);

            // Kích hoạt các hiệu ứng fadein trong app
            const fadeElements = document.querySelectorAll('.fadein, .fadein1');
            fadeElements.forEach((el) => {
                el.style.transform = "translateY(0)";
                el.style.opacity = "1";
            });

            // Sau khi fade out (0.4s) thì ẩn hẳn component
            const hideTimer = setTimeout(() => {
                setIsHidden(true);
            }, 400);

            return () => clearTimeout(hideTimer);
        }, 600); // 600ms để người dùng kịp thấy loader

        return () => clearTimeout(timer);
    }, []);

    if (isHidden) return null;

    return (
        <div className={`preloader ${isFading ? "fade-out" : ""}`}>
            <div className="loader"></div>
        </div>
    );
};

export default Preloader;
