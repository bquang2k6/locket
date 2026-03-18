import axios from "axios";
import * as utils from "../../utils";
import { showError } from "../../components/Toast";

export const getListIdFriends = async () => {
  // Đợi lấy token & uid
  const auth = await utils.getCurrentUserTokenAndUid();;

  if (!auth) {
    console.error("Không lấy được token và uid hiện tại.");
    return [];
  }

  const { idToken, localId, refreshToken } = auth;

  try {
    const res = await axios.post(utils.API_URL.GET_LIST_FRIENDS_URL, {
      idToken, // gửi đúng tên biến
      localId,
    });

    const allFriends = res?.data?.data || [];

    const cleanedFriends = allFriends.map((friend) => ({
      uid: friend.uid,
      createdAt: friend.date,
    }));

    sessionStorage.setItem("friendsList", JSON.stringify(cleanedFriends));

    return cleanedFriends;
  } catch (err) {
    console.error("❌ Lỗi khi gọi API get-friends:", err);
    return [];
  }
};

export const getListRequestFriend = async (
  pageToken = null
) => {
      // Đợi lấy token & uid
  const auth = await utils.getCurrentUserTokenAndUid();;

  if (!auth) {
    console.error("Không lấy được token và uid hiện tại.");
    return [];
  }

  const { idToken, localId, refreshToken } = auth;

  try {
    const res = await axios.post(utils.API_URL.GET_INCOMING_URL, {
      idToken,
      localId,
      pageToken,
    });

    const friends = res?.data?.data || [];
    const cleanedFriends = friends.map((friend) => ({
      uid: friend.uid,
      createdAt: friend.date,
    }));

    const next = res?.data?.data?.nextPageToken || null;

    return {
      friends: cleanedFriends,
      nextPageToken: next,
    };
  } catch (err) {
    console.error("❌ Lỗi khi gọi API get-incoming_friends:", err);
    return {
      friends: [],
      nextPageToken: null,
    };
  }
};
// Hàm xoá nhiều lời mời (tối đa 50 mỗi lần)
export const rejectMultipleFriendRequests = async (
  uidList = [],
  delay = 200
) => {
          // Đợi lấy token & uid
  const auth = await utils.getCurrentUserTokenAndUid();;

  if (!auth) {
    console.error("Không lấy được token và uid hiện tại.");
    return [];
  }

  const { idToken, localId, refreshToken } = auth;

  const results = [];
  const MAX_BATCH = 50;

  // Chia uidList thành các nhóm 50
  for (let i = 0; i < uidList.length; i += MAX_BATCH) {
    const batch = uidList.slice(i, i + MAX_BATCH);

    // Promise all xoá từng uid trong batch
    const batchResults = await Promise.all(
      batch.map(async (uid) => {
        const res = await rejectFriendRequest(idToken, uid);
        return { uid, ...res };
      })
    );

    results.push(...batchResults);

    // Nếu còn batch tiếp theo thì chờ delay
    if (i + MAX_BATCH < uidList.length) {
      console.log(`⏳ Đợi ${delay}ms trước khi xử lý batch tiếp theo...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return results;
};
export const loadFriendDetailsV3 = async (friends) => {
  if (!friends || friends.length === 0) return [];

  const batchSize = 20;
  const allResults = [];

  // 🔥 LẤY TOKEN Ở ĐÂY
  const { idToken } = await utils.getCurrentUserTokenAndUid();
  if (!idToken) {
    console.error("Không có idToken khi loadFriendDetails");
    return [];
  }

  for (let i = 0; i < friends.length; i += batchSize) {
    const batch = friends.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map((friend) =>
        fetchUser(friend.uid, idToken).then((res) =>
          utils.normalizeFriendData(res.data)
        )
      )
    );

    const success = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);

    allResults.push(...success);

    if (i + batchSize < friends.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return allResults;
};

//Tích hợp 2 hàm getListfirend và fetchuser cho thuận tiện việc lấy dữ liệu
export const refreshFriends = async () => {
  try {
    // Lấy danh sách bạn bè (uid, createdAt)
    const friends = await getListIdFriends();
    if (!friends.length) return;

    const { idToken, localId } = utils.getToken() || {};
    if (!idToken || !localId) {
      showError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      return null;
    }
    const friendDetails = await loadFriendDetailsV3(friends);

    // Lưu thời gian cập nhật
    const updatedAt = new Date().toISOString();
    localStorage.setItem("friendsUpdatedAt", updatedAt);
    return {
      friends,
      friendDetails,
      updatedAt,
    };
  } catch (error) {
    console.error("❌ Lỗi khi làm mới danh sách bạn bè:", error);
    return null;
  }
};
export const fetchUser = async (user_uid, idToken) => {
  return await axios.post(
    "https://api.locketcamera.com/fetchUserV2",
    {
      data: {
        user_uid,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    }
  );
};
export const removeFriend = async (user_uid, idToken) => {};
