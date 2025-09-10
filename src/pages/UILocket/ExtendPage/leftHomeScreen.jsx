import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../../context/AuthLocket";
import { ChevronRight, Link } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import AddPostButton from "./Button/AddPostButton";
import axios from "axios";
import LoadingRing from "../../../components/UI/Loading/ring";
import PostCard from "./Container/PostCaptionItems";
import { API_URL } from "../../../utils/API/apiRoutes";
import BadgePlan from "./Badge";
import UsageDisplay from "../../../components/UsageDisplay";
import { useNavigate } from "react-router-dom";

const POSTS_PER_PAGE = 10;

// Helper function to generate unique keys
const generateUniqueKey = (prefix, id, index) => {
  return `${prefix}-${id}-${index}`;
};

const LeftHomeScreen = () => {
  const { user } = useContext(AuthContext);
  const { navigation, useloading } = useApp();
  const { isProfileOpen, setIsProfileOpen } = navigation;
  const { imageLoaded, setImageLoaded } = useloading;

  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef(null);
  const [posts, setPosts] = useState([]);

  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);

  // Function to refresh posts
  const refreshPosts = async () => {
    try {
      const response = await axios.get(API_URL.CAPTION_POSTS_URL);
      
      // Remove duplicates based on ID and keep the most recent one
      const uniquePosts = response.data.reduce((acc, post) => {
        const existingIndex = acc.findIndex(p => p.id === post.id);
        if (existingIndex === -1) {
          acc.push(post);
        } else {
          // Keep the most recent post
          const existing = acc[existingIndex];
          const existingDate = new Date(existing.created_at);
          const newDate = new Date(post.created_at);
          if (newDate > existingDate) {
            acc[existingIndex] = post;
          }
        }
        return acc;
      }, []);
      
      setPosts(uniquePosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    const div = scrollRef.current;
    const handleScroll = () => {
      setIsScrolled(div.scrollTop > 1);
    };
    if (div) div.addEventListener("scroll", handleScroll);
    return () => div?.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    refreshPosts();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isProfileOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [isProfileOpen]);

  // Tính toán posts hiển thị theo trang
  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  // Tổng số trang
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  // Hàm chuyển trang
  const goToPage = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    // Scroll lên đầu danh sách khi đổi trang (tuỳ chọn)
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatPolling, setChatPolling] = useState(null);

  const navigate = useNavigate();

  // Lấy danh sách bạn bè khi mở chat
  useEffect(() => {
    if (isChatOpen) {
      const idToken = localStorage.getItem("idToken");
      const localId = user?.uid;
      if (idToken && localId) {
        axios.post(API_URL.GET_LIST_FRIENDS_URL.toString(), { idToken, localId })
          .then(res => setFriends(res.data.data || []))
          .catch(() => setFriends([]));
      }
    }
  }, [isChatOpen, user]);

  // Lấy lịch sử chat khi chọn bạn
  useEffect(() => {
    if (selectedFriend) {
      const fetchMessages = () => {
        axios.get(`${API_URL.CHAT_GET_MESSAGES}?sender_id=${user.uid}&receiver_id=${selectedFriend.uid}`)
          .then(res => setChatMessages(res.data.messages || []))
          .catch(() => setChatMessages([]));
      };
      fetchMessages();
      // Polling mỗi 2s
      if (chatPolling) clearInterval(chatPolling);
      const poll = setInterval(fetchMessages, 2000);
      setChatPolling(poll);
      return () => clearInterval(poll);
    } else {
      setChatMessages([]);
      if (chatPolling) clearInterval(chatPolling);
    }
  // eslint-disable-next-line
  }, [selectedFriend]);

  // Dọn polling khi đóng chat
  useEffect(() => {
    if (!isChatOpen && chatPolling) {
      clearInterval(chatPolling);
      setChatPolling(null);
    }
  }, [isChatOpen, chatPolling]);

  return (
    <div
      className={`fixed inset-0 flex flex-col transition-transform duration-500 z-50 bg-base-100 ${
        isProfileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
              <AddPostButton onPostAdded={refreshPosts} />

      {/* Header */}
      <div className="flex flex-col shadow-lg px-4 py-2 text-base-content relative overflow-hidden">
        <div className="flex items-center justify-between">
          <BadgePlan />
          <div className="flex items-center gap-3">
            {/* <button
              onClick={() => navigate("/chat")}
              className="rounded-lg hover:bg-base-200 transition cursor-pointer"
              style={{ zIndex: 100 }}
            >
              <svg
                width="35"
                height="35"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="rotate(90 16 16)">
                  <path
                    d="M25.784,21.017C26.581,19.467,27,17.741,27,16c0-6.065-4.935-11-11-11S5,9.935,5,16s4.935,11,11,11
                       c1.742,0,3.468-0.419,5.018-1.215l4.74,1.185C25.838,26.99,25.919,27,26,27c0.262,0,0.518-0.103,0.707-0.293
                       c0.248-0.249,0.349-0.609,0.263-0.95L25.784,21.017z
                       M23.751,21.127l0.874,3.498l-3.498-0.875
                       c-0.247-0.061-0.509-0.026-0.731,0.098C19.055,24.602,17.534,25,16,25c-4.963,0-9-4.038-9-9s4.037-9,9-9s9,4.038,9,9
                       c0,1.534-0.398,3.054-1.151,4.395C23.724,20.618,23.688,20.88,23.751,21.127z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </g>
              </svg>
            </button> */}
            <button
              onClick={() => setIsProfileOpen(false)}
              className="rounded-lg hover:bg-base-200 transition cursor-pointer"
            >
              <ChevronRight size={40} />
            </button>
          </div>
        </div>

        <div
          className={`relative transition-all z-30 duration-500 ease-in-out ${
            isScrolled ? "h-0 opacity-0" : "h-19 mt-2"
          }`}
        >
          <div className="flex flex-row justify-between items-center text-base-content w-full">
            <div className="flex flex-col text-center items-start space-y-1">
              <p className="text-2xl font-semibold">
                {user?.displayName || "Name"}
              </p>
              <a
                href={`https://locket.cam/${user?.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link underline font-semibold flex items-center justify-between"
              >
                @{user?.username} <Link className="ml-2" size={18} />
              </a>
            </div>
            <div className="avatar w-18 h-18 disable-select">
              <div className="rounded-full shadow-md outline-4 outline-amber-400 p-1 flex justify-items-center">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <LoadingRing size={40} stroke={2} color="blue" />
                  </div>
                )}
                <img
                  src={user?.profilePicture || "/prvlocket.png"}
                  alt="Profile"
                  className={`w-19 h-19 transition-opacity duration-300 rounded-full ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            </div>
          </div>




















     





        </div>
        
        {/* Usage Display */}
        <div className="mt-3 px-4">
          <UsageDisplay className="mx-0" />
        </div>
      </div>

      {/* Posts */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
      >
        {currentPosts.map((post, index) => (
          <PostCard 
            key={generateUniqueKey("post", post.id, index)} 
            post={post} 
            onDeleted={(deletedId) => {
              setPosts(prevPosts => prevPosts.filter(post => post.id !== deletedId));
            }}
          />
        ))}

        {/* Phân trang đơn giản */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-3 mt-4">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border bg-gray-200 disabled:opacity-50"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={generateUniqueKey("page", page, i)}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 rounded border ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {isChatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-end z-[9999]">
          <div className="w-full max-w-md h-full bg-white flex flex-col shadow-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <span className="font-bold">Chat với bạn bè</span>
              <button onClick={() => setIsChatOpen(false)} className="text-xl font-bold">×</button>
            </div>
            <div className="flex-1 flex">
              {/* Danh sách bạn bè */}
              <div className="w-1/3 border-r overflow-y-auto">
                {friends.map(f => (
                  <div
                    key={f.uid}
                    className={`p-2 cursor-pointer ${selectedFriend?.uid === f.uid ? "bg-blue-100" : ""}`}
                    onClick={() => setSelectedFriend(f)}
                  >
                    {f.displayName || f.username || f.uid}
                  </div>
                ))}
              </div>
              {/* Khung chat */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-2">
                  {selectedFriend ? (
                    chatMessages.length === 0 ? (
                      <div className="text-gray-400 text-center">Chưa có tin nhắn nào.</div>
                    ) : (
                      chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender_id === user.uid ? "justify-end" : "justify-start"}`}>
                          <div className={`px-3 py-2 rounded-lg ${msg.sender_id === user.uid ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    <div className="text-gray-400 text-center">Chọn bạn để chat</div>
                  )}
                </div>
                {selectedFriend && (
                  <form
                    onSubmit={async e => {
                      e.preventDefault();
                      if (chatInput.trim() === "") return;
                      await axios.post(API_URL.CHAT_SEND_MESSAGE, {
                        sender_id: user.uid,
                        receiver_id: selectedFriend.uid,
                        text: chatInput,
                        timestamp: new Date().toISOString(),
                      });
                      setChatInput("");
                      // Tin nhắn sẽ tự động cập nhật nhờ polling
                    }}
                    className="p-2 border-t flex"
                  >
                    <input
                      className="flex-1 border rounded px-2"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                    />
                    <button type="submit" className="ml-2 px-4 py-1 bg-blue-500 text-white rounded">Gửi</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeftHomeScreen;