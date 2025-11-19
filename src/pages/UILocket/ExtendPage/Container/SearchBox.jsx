import { memo, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../../utils/API/apiRoutes";

const normalizeInputToLink = (input) => {
  if (!input) return "";

  try {
    new URL(input); // nếu input là URL hợp lệ
    return input;
  } catch {
    // Nếu chỉ nhập username → thêm domain
    return `https://locket.cam/${input}`;
  }
};

const SearchBox = ({ searchTerm, onChange }) => {
  const [hasResult, setHasResult] = useState(true);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteToken, setInviteToken] = useState(null);

  const handleSearch = async () => {
    if (!searchTerm) return;

    const link = normalizeInputToLink(searchTerm);
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("idToken");

    setLoading(true);
    try {
      const response = await axios.post(
        API_URL.FETCH_USER_FOR_INVITE,
        { link },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Response shape can be nested. Example payload from API:
      // { success, invite_token, result: { result: { data: { user: { ... }}}}}
      const resp = response?.data || {};
      const userFromResp =
        resp?.result?.result?.data?.user || resp?.result?.data?.user || resp?.user || null;
      const tokenFromResp = resp?.invite_token || resp?.inviteToken || null;

      if (userFromResp) {
        setHasResult(true);
        setUserData(userFromResp); // lưu dữ liệu user
        setInviteToken(tokenFromResp);
      } else {
        setHasResult(false);
        setUserData(null);
        setInviteToken(null);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      setHasResult(false);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm khi nhấn Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="w-full px-1 mt-2">
      <div className="relative flex items-center gap-2">
        <input
          type="text"
          className="w-full border rounded-lg input input-ghost border-base-content transition-shadow font-semibold"
          placeholder="Nhập link locket hoặc username ..."
          value={searchTerm}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button variant="outline" size="sm" 
          className={`w-12 border border-gray-400 rounded-md px-2 -py-15 text-sm hover:bg-gray-100 transition 
            ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Đang tìm..." : "Tìm kiếm"}
        </button>
      </div>

      {!hasResult && searchTerm && (
        <p className="text-center text-gray-400 text-sm mt-3">
          Không tìm thấy ai phù hợp với "{searchTerm}"
        </p>
      )}

      {userData && (
        <div className="mt-4 p-4 border rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={userData.profile_picture_url || '/prvlocket.png'}
              alt={userData.username || 'user'}
              className="w-full h-full object-cover"
              onError={(e) => {
                // fallback to a bundled image if remote fails
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/prvlocket.png';
              }}
            />
          </div>

          <div className="flex-1">
            <p className="font-semibold">
              {userData.first_name || userData.username || 'Unknown'}{' '}
              {userData.last_name || ''}
            </p>
            <p className="text-gray-500">@{userData.username || 'unknown'}</p>
            <p className="text-gray-500">
                Là: {
                    {
                    none: "Không phải là bạn bè",
                    friends: "Bạn bè",
                    "current-user": "Bản thân"
                    }[userData.friendship_status] || "unknown"
                }
            </p>


            {/* <div className="mt-2 flex items-center gap-2">
              {(() => {
                const profileLink =
                  userData.profile_url || `https://locket.cam/${userData.username}`;
                const inviteLink = inviteToken
                  ? `https://locket.cam/invite/${inviteToken}`
                  : profileLink;

                return (
                  <>
                    <a
                      href={profileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-ghost"
                    >
                      Mở hồ sơ
                    </a>

                    <button
                      className="btn btn-sm btn-outline"
                      onClick={async () => {
                        const link = inviteLink;
                        try {
                          await navigator.clipboard.writeText(link);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        } catch (err) {
                          // fallback for older browsers
                          const ta = document.createElement('textarea');
                          ta.value = link;
                          document.body.appendChild(ta);
                          ta.select();
                          try {
                            document.execCommand('copy');
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1500);
                          } catch {}
                          document.body.removeChild(ta);
                        }
                      }}
                    >
                      {copied ? 'Đã sao chép' : inviteToken ? 'Sao chép invite' : 'Sao chép link'}
                    </button>
                  </>
                );
              })()}
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(SearchBox);
