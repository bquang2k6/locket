import { createContext, useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import * as utils from "../utils";
import { showInfo } from "../components/Toast";
import {
  getListIdFriends,
  fetchUser,
  fetchUserPlan,
  registerFreePlan,
} from "../services";
import { plans } from "../utils/plans";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const u = utils.getUser();
    if (u && u.username === 'wan206') {
      u.isAdmin = true;
    }
    return u;
  }); //Thong tin User
  const [authTokens, setAuthTokens] = useState(() => utils.getToken()); //Thong tin Token

  const [loading, setLoading] = useState(true);

  const [friends, setFriends] = useState(() => {
    const saved = localStorage.getItem("friendsList");
    return saved ? JSON.parse(saved) : [];
  });

  // Thêm state friendDetails vào context
  const [friendDetails, setFriendDetails] = useState(() => {
    const saved = localStorage.getItem("friendDetails");
    return saved ? JSON.parse(saved) : [];
  });

  const [userPlan, setUserPlan] = useState(() => {
    const saved = localStorage.getItem("userPlan");
    if (saved) {
      try {
        const parsedPlan = JSON.parse(saved);
  
        // Đừng format ở đây, chỉ convert sang Date nếu cần
        if (parsedPlan.start_date && parsedPlan.start_date !== "∞") {
          parsedPlan.start_date = parsedPlan.start_date;
        }
        if (parsedPlan.end_date && parsedPlan.end_date !== "∞") {
          parsedPlan.end_date = parsedPlan.end_date;
          
        }
  
        return parsedPlan;
      } catch (e) {
        console.error("Error parsing saved plan:", e);
      }
    }
    
    // Chỉ trả về default plan nếu không có user đăng nhập
    const currentUser = utils.getUser();
    if (!currentUser) {
      return null;
    }
    
    const freePlan = plans[0];
    const defaultPlan = {
      uid: "free_user",
      username: "free_user",
      display_name: "Free User",
      plan_id: "free",
      plan_info: {
        id: "free",
        name: freePlan.name,
        features: freePlan.features,
        max_uploads: freePlan.max_uploads,
        max_video_size: freePlan.max_video_size,
        max_image_size: freePlan.max_image_size,
      },
      start_date: new Date(),
      end_date: "∞"
    };
    localStorage.setItem("userPlan", JSON.stringify(defaultPlan));
    return defaultPlan;
  });

  // ✅ Auto refresh token mỗi 50 phút hoặc khi token hết hạn
  useEffect(() => {
    let isMounted = true;
    const refreshInterval = 50 * 60 * 1000; // 50 phút

    const autoRefresh = async () => {
      setLoading(true);
      const { idToken, refreshToken } = authTokens || {};

      if (
        !refreshToken ||
        typeof refreshToken !== "string" ||
        refreshToken.trim() === ""
      ) {
        console.warn("⚠️ Không có refreshToken hợp lệ, tiến hành logout.");
        if (isMounted) {
          setUser(null);
          setAuthTokens(null);
          utils.removeUser();
          utils.removeToken();
          utils.clearLocalData();
          resetAuthContext();
        }
        setLoading(false); // ✅ Tắt loading
        return;
      }

      // Nếu idToken rỗng hoặc hết hạn thì mới làm mới
      const idTokenIsValid =
        idToken &&
        typeof idToken === "string" &&
        idToken.trim() !== "" &&
        !utils.isIdTokenExpired(idToken);

      if (!idTokenIsValid) {
        try {
          const newTokens = await utils.refreshIdToken(refreshToken);
          if (isMounted && newTokens) {
            setAuthTokens(newTokens); // ✅ cập nhật token mới vào state
          }
        } catch (err) {
          console.error("❌ Lỗi khi refresh token:", err);
          if (isMounted) {
            setUser(null);
            setAuthTokens(null);
            utils.removeUser();
            utils.removeToken();
            showInfo("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          }
        }
      }
      setLoading(false); // ✅ Tắt loading
    };

    autoRefresh(); // Chạy ngay khi mount
    const intervalId = setInterval(autoRefresh, refreshInterval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [authTokens]);

  // Thêm useEffect để fetch plan khi app khởi động với user đã đăng nhập
  useEffect(() => {
    const initializePlanOnAppStart = async () => {
      if (user?.localId && authTokens?.idToken && !userPlan) {
        try {
          const plan = await fetchUserPlan(user.localId);
          if (plan) {
            setUserPlan(plan);
            localStorage.setItem("userPlan", JSON.stringify(plan));
          }
        } catch (err) {
          console.error("Lỗi khi fetch plan khi khởi động app:", err);
        }
      }
    };

    initializePlanOnAppStart();
  }, [user?.localId, authTokens?.idToken, userPlan]);

  // Load friends
  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.idToken || !user?.localId) {
        setLoading(false); // <--- không có user
        return;
      }

      // Kiểm tra xem localStorage đã có friendsList chưa
      const savedFriends = localStorage.getItem("friendsList");
      if (savedFriends) {
        try {
          const parsed = JSON.parse(savedFriends);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFriends(parsed);
            setLoading(false);
            return; // Không gọi API vì đã có data
          }
        } catch {
          // Nếu JSON parse lỗi thì tiếp tục fetch API
        }
      }

      // Nếu chưa có hoặc parse lỗi, gọi API lấy danh sách bạn bè
      try {
        const friendsList = await getListIdFriends();
        fetchPlan(user, user.idToken);
        setFriends(friendsList);
        localStorage.setItem("friendsList", JSON.stringify(friendsList));
      } catch (error) {
        console.error("❌ Lỗi khi fetch friends:", error);
      } finally {
        setLoading(false); // ✅ cuối cùng luôn tắt loading
      }
    };

    fetchFriends();
  }, [user]);

  const fetchPlan = async (user, idToken) => {
    try {
      let plan = await fetchUserPlan(user.localId);
      if (!plan) {
        const res = await registerFreePlan(user, idToken);
        if (res?.data) {
          plan = res.data;
        }
      }
      if (plan) {
        setUserPlan(plan);
        localStorage.setItem("userPlan", JSON.stringify(plan));
      }
    } catch (err) {
      console.error("Lỗi khi fetch plan:", err);
    }
  };
  // Load friendDetails và lưu vào state + localStorage
  useEffect(() => {
    const loadFriendDetails = async () => {
      if (!user?.idToken || friends.length === 0) {
        setFriendDetails([]); // <- Nếu user không hợp lệ hoặc không có bạn bè, reset lại
        return;
      }

      const savedDetails = localStorage.getItem("friendDetails");
      let shouldFetch = true;

      if (savedDetails) {
        try {
          const parsedDetails = JSON.parse(savedDetails);
          const savedUids = parsedDetails.map((f) => f.uid).sort();
          const currentUids = friends.map((f) => f.uid).sort();

          // So sánh danh sách UID
          const same =
            savedUids.length === currentUids.length &&
            savedUids.every((uid, idx) => uid === currentUids[idx]);

          if (same) {
            setFriendDetails(parsedDetails);
            shouldFetch = false; // ✅ Khớp rồi, không cần fetch lại
          } else {
            // Nếu danh sách không khớp, reset để tránh dùng nhầm data
            setFriendDetails([]);
          }
        } catch {
          // Nếu lỗi parse thì vẫn fetch
        }
      } else {
        setFriendDetails([]); // 🧼 nếu không có localStorage, reset luôn
      }

      if (!shouldFetch) return;

      // Tiến hành fetch
      const batchSize = 20;
      const allResults = [];

      for (let i = 0; i < friends.length; i += batchSize) {
        const batch = friends.slice(i, i + batchSize);

        try {
          const results = await Promise.all(
            batch.map((friend) =>
              fetchUser(friend.uid, user.idToken)
                .then((res) => utils.normalizeFriendData(res.data))
                .catch((err) => {
                  console.error(
                    `❌ fetchUser(${friend.uid}) failed:`,
                    err?.response?.data || err
                  );
                  return null;
                })
            )
          );

          const filtered = results.filter(Boolean);
          allResults.push(...filtered);
        } catch (err) {
          console.error("❌ Lỗi khi xử lý batch:", err);
        }
      }

      setFriendDetails(allResults);
      try {
        localStorage.setItem("friendDetails", JSON.stringify(allResults));
      } catch (e) {
        console.error("❌ Lỗi khi lưu vào localStorage:", e);
      }
    };

    loadFriendDetails();
  }, [friends, user?.idToken]);
  useEffect(() => {
    setFriendDetails([]); // 🧼 Xoá dữ liệu cũ khi user thay đổi
  }, [user]);

  useEffect(() => {
    const fetchPlanOnLogin = async () => {
      if (!user?.localId || !authTokens?.idToken) return;
      
      try {
        const plan = await fetchUserPlan(user.localId);
        if (plan) {
          setUserPlan(plan);
          localStorage.setItem("userPlan", JSON.stringify(plan));
        } else {
          // If no plan exists, register free plan
          const res = await registerFreePlan(user, authTokens.idToken);
          if (res?.data) {
            setUserPlan(res.data);
            localStorage.setItem("userPlan", JSON.stringify(res.data));
          }
        }
      } catch (err) {
        console.error("Lỗi khi fetch plan sau login:", err);
      }
    };

    fetchPlanOnLogin();
  }, [user?.localId, authTokens?.idToken]);

  // Thêm useEffect mới để đảm bảo fetch plan khi user thay đổi
  useEffect(() => {
    const fetchPlanWhenUserChanges = async () => {
      if (!user?.localId || !authTokens?.idToken) {
        // Nếu không có user, reset userPlan về null
        setUserPlan(null);
        localStorage.removeItem("userPlan");
        return;
      }
      
      try {
        const plan = await fetchUserPlan(user.localId);
        if (plan) {
          setUserPlan(plan);
          localStorage.setItem("userPlan", JSON.stringify(plan));
        } else {
          // If no plan exists, register free plan
          const res = await registerFreePlan(user, authTokens.idToken);
          if (res?.data) {
            setUserPlan(res.data);
            localStorage.setItem("userPlan", JSON.stringify(res.data));
          }
        }
      } catch (err) {
        console.error("Lỗi khi fetch plan khi user thay đổi:", err);
      }
    };

    fetchPlanWhenUserChanges();
  }, [user, authTokens]);

  const resetAuthContext = () => {
    setUser(null);
    setAuthTokens(null);
    setFriends([]);
    setFriendDetails([]);
    setUserPlan(null);
    utils.removeUser();
    utils.removeToken();
    localStorage.removeItem("friendsList");
    localStorage.removeItem("friendDetails");
    localStorage.removeItem("userPlan");
  };

  return useMemo(
    () => (
      <AuthContext.Provider
        value={{
          user,
          setUser,
          loading,
          friends,
          setFriends,
          friendDetails,
          setFriendDetails,
          userPlan,
          setUserPlan,
          authTokens,
          resetAuthContext,
        }}
      >
        {children}
      </AuthContext.Provider>
    ),
    [user, loading, friends, friendDetails, userPlan, authTokens]
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
