import { useContext, useState, useEffect } from "react";
import { useApp } from "../../../../context/AppContext";
import { AuthContext } from "../../../../context/AuthLocket";
import { ChevronRight, Menu, MessageCircle, Users } from "lucide-react";
import { Link } from 'react-router-dom';

const HeaderBeforeCaptureavt = () => {
  const { user, friendDetails } = useContext(AuthContext);
  const { post } = useApp();
  
  
  

  
  // Safe destructuring with fallback
  const {
    selectedFriendUid,
    setSelectedFriendUid,
    setSelectedMoment,
    setSelectedQueue,
  } = post || {}; // Add fallback
  
  const { setIsHomeOpen, setIsProfileOpen } = useApp().navigation;
  
  // States
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [friendName, setFriendName] = useState("Mọi người");
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Update friendName when selectedFriendUid changes
  useEffect(() => {
    if (!selectedFriendUid) {
      setFriendName("Mọi người");
    } else if (selectedFriendUid === user?.uid) {
      setFriendName("Bạn");
    } else {
      const friend = friendDetails.find(f => f.uid === selectedFriendUid);
      if (friend) {
        const name = `${friend.firstName || ""} ${friend.lastName || ""}`.trim();
        setFriendName(name || friend.username || "Người dùng");
      }
    }
  }, [selectedFriendUid, friendDetails, user]);

  const truncateName = (name, length = 10) => {
    return name.length > length ? name.slice(0, length) + "..." : name;
  };

  const toggleDropdown = () => {
    if (!isVisible) {
      setIsVisible(true);
      setTimeout(() => setIsOpen(true), 10);
    } else {
      setIsOpen(false);
      setTimeout(() => setIsVisible(false), 500);
    }
  };

  const filteredFriends = friendDetails.filter((friend) => {
    const fullName = `${friend.firstName} ${friend.lastName}`.toLowerCase();
    const username = (friend.username || "").toLowerCase();
    const term = searchTerm.toLowerCase();

    return fullName.includes(term) || username.includes(term);
  });

  const handleSelectFriend = (uid, name) => {
    
    
    // Check if setSelectedFriendUid exists and is a function
    if (!setSelectedFriendUid) {
      
      return;
    }
    
    if (typeof setSelectedFriendUid !== 'function') {
      
      return;
    }

    try {
      setSelectedFriendUid(uid);
      setFriendName(name || "Mọi người");
      setIsOpen(false);
      
      // Reset other selections safely
      if (typeof setSelectedMoment === 'function') setSelectedMoment(null);
      if (typeof setSelectedQueue === 'function') setSelectedQueue(null);
      
      setTimeout(() => setIsVisible(false), 500);
      
      
    } catch (error) {
      
    }
  };

  // Early return if post context is not available
  if (!post) {
    return (
      <div className="navbar top-0 left-0 w-full px-4 py-2 flex items-center justify-between bg-base-100 z-50 relative">
        <div className="text-center w-full">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="navbar top-0 left-0 w-full px-4 py-2 flex items-center justify-between bg-base-100 z-50 relative">
        {/* Avatar bên trái */}
        <button
          onClick={() => setIsProfileOpen(true)}
          className="absolute left-0 top-1 flex items-center justify-center w-11 h-11 cursor-pointer -ml-1 mt-1"
        >
          {/* Nền mờ phía dưới */}
          <div className="bg-primary/50 backdrop-blur-3xl opacity-60 w-11 h-11 rounded-full absolute" />

          {/* Avatar */}
          {!isImageLoaded && (
            <div className="absolute w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
          )}
          <img
            src={user?.profilePicture || "/prvlocket.png"}
            alt="avatar"
            onLoad={() => setIsImageLoaded(true)}
            className={`rounded-full h-10 w-10 relative transition-opacity duration-300 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />

          
        </button>

        {/* Container để canh giữa */}
        <div className="flex justify-center items-center w-full">

          {/* Nút ở giữa - Hiển thị tên người được chọn */}
          <button
            className="bg-base-300/20 whitespace-nowrap drop-shadow-2xl backdrop-blur-md px-4 py-2.5 rounded-3xl font-semibold text-md flex items-center cursor-pointer hover:bg-base-300 transition"
            onClick={toggleDropdown}
          >
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-1.5 8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-3Zm6.82-3.096a5.51 5.51 0 0 0-2.797-6.293 3.5 3.5 0 1 1 2.796 6.292ZM19.5 18h.5a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-1.1a5.503 5.503 0 0 1-.471.762A5.998 5.998 0 0 1 19.5 18ZM4 7.5a3.5 3.5 0 0 1 5.477-2.889 5.5 5.5 0 0 0-2.796 6.293A3.501 3.501 0 0 1 4 7.5ZM7.1 12H6a4 4 0 0 0-4 4 2 2 0 0 0 2 2h.5a5.998 5.998 0 0 1 3.071-5.238A5.505 5.505 0 0 1 7.1 12Z"
                clipRule="evenodd"
              />
            </svg>
            
            {/* Hiển thị tên được truncate nếu quá dài */}
            <span className="ml-1">{truncateName(friendName, 12)}</span>
            
            {/* Mũi tên dropdown */}
            <svg 
              className={`w-4 h-4 ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Nút bên phải */}
        <div className="flex items-center gap-3">
          {/* Thay <button> bằng <Link> và chuyển className vào */}
          <Link 
            to="/chat" 
            className="p-2 bg-base-200 mr-2 rounded-lg hover:bg-base-300 transition inline-block"
          >
            <MessageCircle size={26} className="text-base-content" />
          </Link>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isVisible && (
        <div
          onClick={toggleDropdown}
          className={`fixed inset-0 z-50 flex justify-center items-start backdrop-blur-[2px] mt-14 px-4 bg-black/30
            transition-opacity duration-500 ease-in-out
            ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`overflow-hidden w-full max-w-md max-h-[500px] transition-all duration-500 ease-in-out transform origin-top
              ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-0"}
              bg-base-100 border border-base-300 rounded-xl shadow-md px-4 py-3`}
          >
            <h3 className="font-semibold mb-3 text-base">Danh sách bạn bè</h3>
            <div className="relative w-full mt-2">
              <input
                type="text"
                className="w-full pr-10 border rounded-lg input input-ghost border-base-content transition-shadow font-semibold"
                placeholder="Tìm kiếm bạn bè..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute z-1 right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            
            <div className="space-y-3 max-h-90 overflow-y-auto pt-4">
              {filteredFriends && filteredFriends.length > 0 ? (
                <>
                  {/* Mọi người */}
                  <div
                    onClick={() => handleSelectFriend(null, "Mọi người")}
                    className={`flex items-center justify-between hover:bg-base-200 px-3 py-2 rounded-lg transition cursor-pointer pt-2 mt-2 ${
                      !selectedFriendUid ? 'bg-primary/20 border border-primary/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-11 h-11 rounded-full border-[2.5px] p-2 border-amber-400 object-cover" />
                      <span className="text-base font-medium">Mọi người</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-base-content" />
                  </div>

                  {/* Danh sách bạn bè */}
                  {filteredFriends.map((friend) => (
                    <div
                      key={friend.uid}
                      onClick={() =>
                        handleSelectFriend(
                          friend.uid,
                          `${friend.firstName || ""} ${friend.lastName || ""}`.trim()
                        )
                      }
                      className={`flex items-center justify-between hover:bg-base-200 px-3 py-2 rounded-lg transition cursor-pointer ${
                        selectedFriendUid === friend.uid ? 'bg-primary/20 border border-primary/30' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={friend.profilePic || "/prvlocket.png"}
                          alt={friend.name || "avatar"}
                          className="w-11 h-11 rounded-full border-[2.5px] p-0.5 border-amber-400 object-cover"
                        />
                        <span className="text-base font-medium">
                          {friend.firstName} {friend.lastName}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-base-content" />
                    </div>
                  ))}

                  {/* Bạn */}
                  <div
                    onClick={() => handleSelectFriend(user?.uid, "Bạn")}
                    className={`flex items-center justify-between hover:bg-base-200 px-3 py-2 rounded-lg transition cursor-pointer pt-2 mt-2 ${
                      selectedFriendUid === user?.uid ? 'bg-primary/20 border border-primary/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user?.profilePicture || "/prvlocket.png"}
                        alt="Bạn"
                        className="w-11 h-11 rounded-full border-[2.5px] p-0.5 border-base-300 object-cover"
                      />
                      <span className="text-base font-medium">Bạn</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-base-content" />
                  </div>
















                </>
              ) : (
                <div className="text-gray-400 italic text-sm text-center mt-6">
                  Không có bạn bè
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderBeforeCaptureavt;