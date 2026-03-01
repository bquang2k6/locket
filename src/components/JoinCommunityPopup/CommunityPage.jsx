import React from "react";
import { MessageCircle, Facebook, Send, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CommunityPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="w-96 max-w-full bg-base-100 rounded-3xl p-6 shadow-2xl">

        <h2 className="text-lg font-bold mb-6 text-center">
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

        {/* Back button */}
        <div className="mt-8">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-neutral text-white hover:opacity-90 transition"
          >
            <ArrowLeft size={18} />
            Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;