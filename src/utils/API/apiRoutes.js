import { getBackendUrl } from "../backendConfig";

const getBaseUrl = async () => {
  return await getBackendUrl();
};

const getBaseDbUrl = () => {
  return import.meta.env.VITE_BASE_API_URL_DB;
};

const getBaseWsUrl = () => {
  return import.meta.env.VITE_BASE_API_URL_WS;
};

// Initialize with default backend URL
let BASE_API_URL = import.meta.env.VITE_BASE_API_URL;
const BASE_DB_API_URL = getBaseDbUrl();
let BASE_WS_API_URL = getBaseWsUrl(); // Thêm dòng này

const initializeApiUrl = async () => {
  try {
    const newUrl = await getBaseUrl();
    if (newUrl) {
      BASE_API_URL = newUrl;
    }

    // Nếu custom backend có WebSocket tương ứng
    if (newUrl?.startsWith("https://")) {
      BASE_WS_API_URL = newUrl.replace("https://", "wss://");
    } else if (newUrl?.startsWith("http://")) {
      BASE_WS_API_URL = newUrl.replace("http://", "ws://");
    } else if (getBaseWsUrl()) {
      // 👇 Ưu tiên dùng VITE_BASE_API_URL_WS nếu có
      BASE_WS_API_URL = getBaseWsUrl();
    }
  } catch (error) {
    console.warn("Failed to initialize API URL:", error);
  }
};



// Initialize custom backend URL if configured
initializeApiUrl();
setInterval(initializeApiUrl, 30000);

const LOCKET_URL = "/locket";
const LOCKET_PRO = "/locketpro";
const SUBSCRIPTION = "/subscription";

const createApiUrlString = (path) => {
  // Always use a backend URL - either custom or default
  return `${BASE_API_URL}${path}`;
};

const createDbApiUrlString = (path) => {
  return `${BASE_DB_API_URL}${path}`;
};
const createWsUrlString = (path) => {
  return `${BASE_WS_API_URL}${path}`;
};


class DynamicUrl {
  constructor(urlGetter) {
    this.urlGetter = urlGetter;
  }

  toString() {
    return this.urlGetter();
  }

  valueOf() {
    return this.urlGetter();
  }
}

export const API_URL = {
  // Core API endpoints
  CHECK_SERVER: new DynamicUrl(() => createApiUrlString("/keepalive")),
  LOGIN_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/login`)),
  LOGIN_URL_V2: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/login`)),
  LOGOUT_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/logout`)),
  CHECK_AUTH_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/checkauth`)),
  GET_INFO_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/getinfo`)),
  REFESH_TOKEN_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/refresh-token`)),
  GET_LIST_FRIENDS_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/get-allfriends`)),
  UPLOAD_MEDIA_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/upload-media`)),
  GET_USER: "https://api.locketcamera.com/fetchUserV2",
  GET_INCOMING_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/get-incoming_friends`)),
  DELETE_FRIEND_REQUEST_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/delete-incoming_friends`)),
  MARK_AS_READ: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/markAsRead`)),
  SEND_CHAT_MESSAGE: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/sendChatMessageV2`)),
  SEND_REACTION_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/reactMomentV3`)),
  INFO_REACTION_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/reactinfoMomentV3`)),
  GET_MOMENTV2_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/getPost`)),
  GET_LATEST_MOMENT: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/getLatestMomentV2`)),
  FETCH_USER_FOR_INVITE: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/fetchUserForInvite`)),
  INCOMING_FRIEND_REQUESTS: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/incoming_friend_requests`)),
  OUTGOING_FRIEND_REQUESTS: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/outgoing_friend_requests`)),
  DELETE_MOMENT_V2: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/deleteMomentV2`)),

  ROLLCALL_POSTS: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/getRollcallPosts`)),
  ROLLCALL_REACTION: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/postRollcallReaction`)),
  ROLLCALL_COMMENT: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/postRollcallComment`)),
  ROLLCALL_LIKE_COMMENT: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/likeRollcallComment`)),
  DELETE_ROLLCALL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/deleteRollcallPost`)),

  GET_All_MESSAGE: new DynamicUrl(() => createWsUrlString(`${LOCKET_URL}/getAllMessageV2`)),
  GET_All_MESSAGE_WITH_USER: new DynamicUrl(() => createWsUrlString(`${LOCKET_URL}/getMessageWithUserV2`)),
  SEND_CHAT_MESSAGE_REACTION: new DynamicUrl(() => createWsUrlString(`${LOCKET_URL}/sendChatMessageReaction`)),

  // API lấy dữ liệu từ máy chủ
  GET_LASTEST_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_PRO}/getmoment`)),
  GET_CAPTION_THEMES: createDbApiUrlString(`${LOCKET_PRO}/themes`),
  GET_TIMELINE: createDbApiUrlString(`${LOCKET_PRO}/timelines`),
  DONATE_URL: createDbApiUrlString(`${LOCKET_PRO}/donations`),
  NOTIFI_URL: createDbApiUrlString(`${LOCKET_PRO}/notification`),
  USER_THEMES_POSTS_URL: createDbApiUrlString(`${LOCKET_PRO}/user-themes/posts`),
  CAPTION_POSTS_URL: createDbApiUrlString(`${LOCKET_PRO}/user-themes/caption-posts`),
  DELETE_CAPTION_POST_URL: (postId) => createDbApiUrlString(`${LOCKET_PRO}/user-themes/caption-posts/${postId}`),
  POST_USER_THEMES_POSTS_URL: createDbApiUrlString(`${LOCKET_PRO}/user-themes/posts`),   

  // Có vẻ không liên quan đến Subscription
  SUBCRIBE: createDbApiUrlString(`${LOCKET_PRO}/subscribe`),

  // API Subscription
  REGISTER_USER_PLANS: createDbApiUrlString(`${SUBSCRIPTION}/user-plans/register`),
  GET_USER_PLANS: createDbApiUrlString(`${SUBSCRIPTION}/user-plans`),
  GET_USER_SUBSCRIPTION: (userId) => createDbApiUrlString(`${SUBSCRIPTION}/user-plans/${userId}`),
  CHECK_PAYMENT_STATUS: (order_id) => createDbApiUrlString(`${SUBSCRIPTION}/check-payment-status/${order_id}`),
  CANCEL_PAYMENT: (order_id) => createDbApiUrlString(`${SUBSCRIPTION}/payment/cancel/${order_id}`),
  CHECK_TRIAL_ABILITY: (uid) => createDbApiUrlString(`${SUBSCRIPTION}/trialoffer/${uid}`),
  REG_TRIAL: createDbApiUrlString(`${SUBSCRIPTION}/trialoffer/register`),
  
  // Usage Limits API
  CHECK_USAGE_LIMITS: (userId, limitType) => createDbApiUrlString(`/api/usage/check/${userId}/${limitType}`),
  RECORD_USAGE: createDbApiUrlString(`/api/usage/record`),
  GET_USAGE_STATS: (userId) => createApiUrlString(`/usage/stats/${userId}`), // For gif_caption (Lk_upload-js-master)
  GET_CAPTION_USAGE_STATS: (userId) => createDbApiUrlString(`/api/usage/stats/${userId}`), // For caption (DB-LK-master)
  VALIDATE_FILE_SIZE: createDbApiUrlString(`/api/usage/validate-file`),
};
