import axios from "axios";
import * as utils from "../../utils";
import { encryptLoginData } from "../../utils/security";
import * as locketService from "../locketService";

//Login
export const login = async (email, password) => {
  try {
    // Encrypt credentials
    const { encryptedEmail, encryptedPassword } = encryptLoginData(email, password);

    const res = await axios.post(
      utils.API_URL.LOGIN_URL_V2,
      { 
        email: encryptedEmail, 
        password: encryptedPassword 
      },
      { withCredentials: true }
    );

    // Check if API returns error with 200 status
    if (res.data?.success === false) {
      console.error("Login failed:", res.data.message);
      return null;
    }

    // Extract user data from the response
    const loginData = res.data;
    if (!loginData || !loginData.idToken) {
      console.error("Invalid response format");
      return null;
    }

    // Fetch complete user info
    const userInfo = await locketService.getInfo(loginData.idToken, loginData.localId);

    // Return complete user data
    return {
      data: {
        ...userInfo,
        idToken: loginData.idToken,
        refreshToken: loginData.refreshToken,
        localId: loginData.localId
      }
    };
  } catch (error) {
    if (error.response && error.response.data?.error) {
      throw error.response.data.error;
    }
    console.error("❌ Network Error:", error.message);
    throw new Error(
      "Có sự cố khi kết nối đến hệ thống, vui lòng thử lại sau ít phút."
    );
  }
};

export const refreshIdToken = async (refreshToken) => {
  try {
    const res = await axios.post(
      utils.API_URL.REFESH_TOKEN_URL,
      { refreshToken },
      { withCredentials: true } // Nhận cookie từ server
    );
    // Kiểm tra nếu API trả về lỗi nhưng vẫn có status 200
    // if (res.data?.success === false) {
    //   console.error("Login failed:", res.data.message);
    //   return null;
    // }

    return res.data.idToken; // Trả về dữ liệu từ server
  } catch (error) {
    if (error.response && error.response.data?.error) {
      throw error.response.data.error; // ⬅️ Ném lỗi từ `error.response.data.error`
    }
    console.error("❌ Network Error:", error.message);
    throw new Error(
      "Có sự cố khi kết nối đến hệ thống, vui lòng thử lại sau ít phút."
    );
  }
};

//Logout
export const logout = async () => {
  try {
    const response = await axios.get(utils.API_URL.LOGOUT_URL, {
      withCredentials: true,
    });
    return response.data; // ✅ Trả về dữ liệu từ API (ví dụ: { message: "Đã đăng xuất!" })
  } catch (error) {
    console.error(
      "❌ Lỗi khi đăng xuất:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message; // ✅ Trả về lỗi nếu có
  }
};
