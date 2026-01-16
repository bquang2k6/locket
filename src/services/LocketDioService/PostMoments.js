import axios from "axios";
import * as utils from "../../utils";
import { API_URL } from "../../utils/API/apiRoutes";

export const uploadMedia = async (payload) => {
  try {
    const { mediaInfo } = payload;
    const fileType = mediaInfo.type;

    // Set timeout based on file type
    const timeoutDuration = fileType === "image" ? 5000 : fileType === "video" ? 10000 : 5000;
    const timeoutId = setTimeout(() => {
      console.log("⏳ Uploading is taking longer than expected...");
    }, timeoutDuration);

    // Streak update logic
    const today = new Date();
    const todayString = today.getFullYear().toString() + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getDate().toString().padStart(2, '0');
    
    const lastUpdatedStr = localStorage.getItem("last_updated_yyyymmdd");
    const lastUpdated = lastUpdatedStr ? parseInt(lastUpdatedStr) : 0;
    const todayInt = parseInt(todayString);
    
    // Add streak update payload if it's a different day
    if (lastUpdated !== todayInt) {
      payload.options = payload.options || {};
      payload.options.update_streak_for_yyyymmdd = todayInt;
      // Update the last updated date in localStorage
      // localStorage.setItem("last_updated_yyyymmdd", todayString);
      console.log("📅 Streak update added for date:", todayString);
    } else {
      console.log("📅 Same day upload, no streak update needed");
    }

    // Create FormData for the request
    const formData = new FormData();
    formData.append("userId", payload.userData.localId);
    formData.append("idToken", payload.userData.idToken);
    formData.append("caption", payload.options.caption || "");
    formData.append("options", JSON.stringify(payload.options || {}));

    // Add media file
    if (fileType === "image") {
      formData.append("images", mediaInfo.file);
    } else {
      formData.append("videos", mediaInfo.file);
    }

    // Send request with FormData
    const response = await axios.post(utils.API_URL.UPLOAD_MEDIA_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    clearTimeout(timeoutId);
    console.log("✅ Upload successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Upload error:", error.response?.data || error.message);

    if (error.response) {
      console.error("📡 Server Error:", error.response);
    } else {
      console.error("🌐 Network Error:", error.message);
    }

    throw error;
  }
};

export const uploadMediaV2 = async (payload) => {
  try {
    const { mediaInfo } = payload;
    const fileType = mediaInfo.type;

    // Set timeout based on file type
    const timeoutDuration = fileType === "image" ? 5000 : fileType === "video" ? 10000 : 5000;
    const timeoutId = setTimeout(() => {
      console.log("⏳ Uploading is taking longer than expected...");
    }, timeoutDuration);

    // Streak update logic
    const today = new Date();
    const todayString = today.getFullYear().toString() + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getDate().toString().padStart(2, '0');
    
    const lastUpdatedStr = localStorage.getItem("last_updated_yyyymmdd");
    const lastUpdated = lastUpdatedStr ? parseInt(lastUpdatedStr) : 0;
    const todayInt = parseInt(todayString);
    
    // Add streak update payload if it's a different day
    if (lastUpdated !== todayInt) {
      payload.options = payload.options || {};
      payload.options.update_streak_for_yyyymmdd = todayInt;
      // Update the last updated date in localStorage
      // localStorage.setItem("last_updated_yyyymmdd", todayString);
      console.log("📅 Streak update added for date:", todayString);
    } else {
      console.log("📅 Same day upload, no streak update needed");
    }

    // Create FormData for the request
    const formData = new FormData();
    formData.append("userId", payload.userData.localId);
    formData.append("idToken", payload.userData.idToken);
    formData.append("caption", payload.options.caption || "");
    formData.append("options", JSON.stringify(payload.options || {}));

    // Add media file
    if (fileType === "image") {
      formData.append("images", mediaInfo.file);
    } else {
      formData.append("videos", mediaInfo.file);
    }

    // Send request with FormData
    const response = await axios.post(utils.API_URL.UPLOAD_MEDIA_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    clearTimeout(timeoutId);
    console.log("✅ Upload successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Upload error:", error.response?.data || error.message);

    if (error.response) {
      console.error("📡 Server Error:", error.response);
    } else {
      console.error("🌐 Network Error:", error.message);
    }

    throw error;
  }
};

export const PostMoments = async (payload) => {
  try {
    const { mediaInfo } = payload;
    const fileType = mediaInfo.type;

    const timeoutDuration = fileType === "image" ? 5000 : fileType === "video" ? 10000 : 5000;
    const timeoutId = setTimeout(() => {
      console.log("⏳ Uploading is taking longer than expected...");
    }, timeoutDuration);

    // Lấy userPlan từ localStorage để gửi plan_id
    const userPlanStr = localStorage.getItem("userPlan");
    let plan_id = 'free'; // Default to free plan
    
    if (userPlanStr) {
      try {
        const userPlan = JSON.parse(userPlanStr);
        plan_id = userPlan.plan_id || 'free';
      } catch (e) {
        console.error("Error parsing userPlan:", e);
      }
    }

    // Streak update logic
    const today = new Date();
    const todayString = today.getFullYear().toString() + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getDate().toString().padStart(2, '0');
    
    const lastUpdatedStr = localStorage.getItem("last_updated_yyyymmdd");
    const lastUpdated = lastUpdatedStr ? parseInt(lastUpdatedStr) : 0;
    const todayInt = parseInt(todayString);
    
    // Add streak update payload if it's a different day
    if (lastUpdated !== todayInt) {
      payload.options.update_streak_for_yyyymmdd = todayInt;
      // Update the last updated date in localStorage
      // localStorage.setItem("last_updated_yyyymmdd", todayString);
      console.log("📅 Streak update added for date:", todayString);
    } else {
      console.log("📅 Same day upload, no streak update needed");
    }

    // Create FormData
    const formData = new FormData();
    formData.append("userId", payload.userData.localId);
    formData.append("idToken", payload.userData.idToken);
    formData.append("options", JSON.stringify(payload.options));
    formData.append("caption", payload.options.caption || "");
    formData.append("plan_id", plan_id); // Gửi plan_id để backend kiểm tra giới hạn
    
    // Add the actual file
    if (fileType === "image") {
      formData.append("images", mediaInfo.file);
    } else {
      formData.append("videos", mediaInfo.file);
    }

    // Send request with FormData
    const response = await axios.post(utils.API_URL.UPLOAD_MEDIA_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    clearTimeout(timeoutId);
    console.log("✅ Upload successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Upload error:", error.response?.data || error.message);
    if (error.response) {
      console.error("📡 Server Error:", error.response);
    } else {
      console.error("🌐 Network Error:", error.message);
    }
    throw error;
  }
};

export const deleteCaptionPost = async (postId, adminKey) => {
  try {
    const url = `https://api4locketwan.antiviet.click/locketpro/user-themes/caption-posts/${postId}`;
    
    const response = await axios.delete(url, {
      data: {
        post_id: postId,
        admin_key: adminKey
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Delete caption post error:", error.response?.data || error.message);
    throw error;
  }
};
