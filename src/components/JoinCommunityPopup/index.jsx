import React, { useEffect, useState } from "react";
import { MessageCircle, Facebook, Send } from "lucide-react";

const JoinCommunityPopup = () => {
  const [visible, setVisible] = useState(false);

  // Kiểm tra ẩn 2 ngày
  useEffect(() => {
    const hiddenUntil = localStorage.getItem("community_hidden_until");

    if (hiddenUntil) {
      const now = new Date();
      const hiddenTime = new Date(hiddenUntil);

      if (now < hiddenTime) {
        return; // vẫn đang bị ẩn
      } else {
        localStorage.removeItem("community_hidden_until");
      }
    }

    setVisible(true);
  }, []);

  const closePopup = () => {
    setVisible(false);
  };

  const dismissFor2Days = () => {
    const hiddenUntil = new Date();
    hiddenUntil.setDate(hiddenUntil.getDate() + 2);

    localStorage.setItem(
      "community_hidden_until",
      hiddenUntil.toISOString()
    );

    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div className="w-96 max-w-[90%] bg-base-100 rounded-3xl p-6 shadow-2xl animate-fadeIn">

        <h2 className="text-lg font-bold mb-5 text-center">
          Tham gia cộng đồng để nhận thông báo sớm nhất
        </h2>

        {/* Links */}
        <div className="space-y-3">
          <a
            href="https://discord.gg/tN6Ejzcr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-2xl bg-base-200 hover:bg-base-300 transition"
          >
            <MessageCircle size={20} />
            <div>
              <div className="font-semibold">Discord</div>
              <div className="text-sm opacity-70">
                Tham gia server Discord của chúng mình
              </div>
            </div>
          </a>

          <a
            href="https://www.facebook.com/profile.php?id=61587155137185"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-2xl bg-base-200 hover:bg-base-300 transition"
          >
            <Facebook size={20} />
            <div>
              <div className="font-semibold">Facebook Page</div>
              <div className="text-sm opacity-70">
                Theo dõi fanpage Facebook
              </div>
            </div>
          </a>

          <a
            href="https://m.me/ch/AbYrAzHe2so0FyZ7/?send_source=cm%3Acopy_invite_link"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-2xl bg-base-200 hover:bg-base-300 transition"
          >
            <Send size={20} />
            <div>
              <div className="font-semibold">Messenger Chat</div>
              <div className="text-sm opacity-70">
                Chat trực tiếp qua Messenger
              </div>
            </div>
          </a>
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={closePopup}
            className="w-full py-2 rounded-xl bg-neutral text-white"
          >
            Đóng
          </button>

          <button
            onClick={dismissFor2Days}
            className="w-full py-2 rounded-xl border border-base-300 hover:bg-base-200 transition font-semibold"
          >
            Đóng trong 2 ngày
          </button>
        </div>
      </div>

      {/* Click nền để đóng */}
      <div
        className="absolute inset-0 -z-10"
        onClick={closePopup}
      />
    </div>
  );
};

export default JoinCommunityPopup;