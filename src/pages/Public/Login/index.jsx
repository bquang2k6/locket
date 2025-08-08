import { useState, useContext, useEffect } from "react";
import { showToast } from "../../../components/Toast";
import * as locketService from "../../../services/locketService";
import { AuthContext } from "../../../context/AuthLocket";
import * as utils from "../../../utils";
import LoadingRing from "../../../components/UI/Loading/ring";
import StatusServer from "../../../components/UI/StatusServer";
import { useApp } from "../../../context/AppContext";
import FloatingNotification from "../../../components/UI/FloatingNotification";
import Turnstile from "react-turnstile";
import { isUsingCustomBackend } from "../../../utils/backendConfig";
import { fetchUserPlan } from "../../../services/LocketDioService/getInfoPlans";
import { 
  checkLoginLockout, 
  incrementLoginAttempts, 
  resetLoginAttempts, 
  getLoginAttemptsInfo 
} from "../../../utils/auth";
import LoginAttemptsInfo from "../../../components/UI/LoginAttemptsInfo";

const Login = () => {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [rememberMe, setRememberMe] = useState(() => {
    const stored = localStorage.getItem("rememberMe");
    return stored === null ? true : stored === "true";
  });

  // State cho việc giới hạn đăng nhập theo email
  const [loginAttemptsInfo, setLoginAttemptsInfo] = useState(() => getLoginAttemptsInfo(email));
  const [lockoutTimer, setLockoutTimer] = useState(null);

  const { useloading } = useApp();
  const { isStatusServer, isLoginLoading, setIsLoginLoading } = useloading;
  
  // Check if using custom backend
  const [isTurnstileEnabled, setIsTurnstileEnabled] = useState(!isUsingCustomBackend());

  useEffect(() => {
    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberMe");
    }
  }, [rememberMe]);

  // Update Turnstile state when custom backend changes
  useEffect(() => {
    setIsTurnstileEnabled(!isUsingCustomBackend());
  }, []);

  // Cập nhật thông tin đăng nhập khi email thay đổi
  useEffect(() => {
    const info = getLoginAttemptsInfo(email);
    setLoginAttemptsInfo(info);
  }, [email]);

  // Timer để cập nhật thời gian khóa
  useEffect(() => {
    if (loginAttemptsInfo.isLocked && loginAttemptsInfo.remainingTime > 0) {
      const timer = setInterval(() => {
        const updatedInfo = getLoginAttemptsInfo(email);
        setLoginAttemptsInfo(updatedInfo);
        
        if (!updatedInfo.isLocked) {
          clearInterval(timer);
          setLockoutTimer(null);
        }
      }, 1000); // Cập nhật mỗi giây
      
      setLockoutTimer(timer);
      
      return () => {
        clearInterval(timer);
      };
    }
  }, [loginAttemptsInfo.isLocked, email]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Kiểm tra xem email có đang bị khóa không
    const lockoutCheck = checkLoginLockout(email);
    if (lockoutCheck.isLocked) {
      showToast("error", `Email ${email} đã bị khóa. Vui lòng thử lại sau ${lockoutCheck.remainingTime} phút.`);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("error", "Email không hợp lệ!");
      return;
    }

    if (isTurnstileEnabled && !turnstileToken) {
      showToast("error", "Vui lòng xác thực Turnstile!");
      return;
    }

    setIsLoginLoading(true);
    try {
      const res = await locketService.login(email, password, turnstileToken);
      if (!res) throw new Error("Lỗi: Server không trả về dữ liệu!");

      const { idToken, refreshToken, localId } = res.data;

      // ⚡️ Lưu refreshToken theo rememberMe
      // Khi login thành công:
      utils.saveToken({ idToken, refreshToken, localId }, rememberMe);

      // ⚡️ Lưu user data toàn bộ (gồm thông tin cá nhân)
      utils.saveUser(res.data);
      setUser(res.data);

      // Reset số lần đăng nhập thất bại cho email này khi thành công
      resetLoginAttempts(email);
      setLoginAttemptsInfo(getLoginAttemptsInfo(email));

      // Đảm bảo fetch plan ngay sau khi set user
      try {
        const plan = await fetchUserPlan(res.data.localId);
        if (plan) {
          // Plan sẽ được set thông qua context useEffect
          console.log("Plan fetched successfully after login");
        }
      } catch (err) {
        console.error("Error fetching plan after login:", err);
      }

      showToast("success", "Đăng nhập thành công!");
    } catch (error) {
      // Tăng số lần đăng nhập thất bại cho email này
      const attemptResult = incrementLoginAttempts(email);
      setLoginAttemptsInfo(getLoginAttemptsInfo(email));
      
      if (error.status) {
        const { status, message } = error;
        switch (status) {
          case 400:
          case 401:
            if (attemptResult.isLocked) {
              showToast("error", `Email ${email} Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ${attemptResult.remainingTime} phút.`);
            } else {
              showToast("error", `Tài khoản hoặc mật khẩu không đúng! Email ${email} còn ${attemptResult.remainingAttempts} lần thử.`);
            }
            break;
          case 403:
            showToast("error", "Bạn không có quyền truy cập.");
            window.location.href = "/login";
            break;
          case 500:
            if (error.message.includes("Bad Request")) {
              if (attemptResult.isLocked) {
                showToast("error", `Email ${email} đã bị khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ${attemptResult.remainingTime} phút.`);
              } else {
                showToast("error", `Email hoặc mật khẩu không đúng! Email ${email} còn ${attemptResult.remainingAttempts} lần thử.`);
              }
            } else {
              showToast("error", "Lỗi hệ thống, vui lòng thử lại sau!");
            }
            break;
          default:
            showToast("error", message || "Đăng nhập thất bại!");
        }
      } else {
        showToast(
          "error",
          error.message || "Lỗi kết nối! Vui lòng kiểm tra lại mạng."
        );
      }
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Tính toán trạng thái disabled cho button
  const isButtonDisabled = 
    isStatusServer !== true || 
    isLoginLoading || 
    (isTurnstileEnabled && !turnstileToken) ||
    loginAttemptsInfo.isLocked;

  return (
    <>
      <div className="flex items-center justify-center h-screen bg-base-200 px-6">
        <div className="w-full max-w-md p-7 shadow-lg rounded-xl bg-opacity-50 backdrop-blur-3xl bg-base-100 border-base-300 text-base-content">
          <h1 className="text-3xl font-bold text-center">Đăng Nhập Locket</h1>
          
          {/* Component hiển thị thông tin khóa đăng nhập theo email */}
          {email && <LoginAttemptsInfo email={email} />}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <legend className="fieldset-legend">Email</legend>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-lg input input-ghost border-base-content"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loginAttemptsInfo.isLocked}
              />
            </div>
            <div>
              <legend className="fieldset-legend">Mật khẩu</legend>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-lg input input-ghost border-base-content"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loginAttemptsInfo.isLocked}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="rememberMe"
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                disabled={loginAttemptsInfo.isLocked}
              />
              <label
                htmlFor="rememberMe"
                className="cursor-pointer select-none text-sm"
              >
                Ghi nhớ đăng nhập
              </label>
            </div>

            {isTurnstileEnabled && (
              <div className="flex justify-center my-4">
                <Turnstile
                  sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                  onVerify={(token) => setTurnstileToken(token)}
                  theme="light"
                />
              </div>
            )}

            <button
              type="submit"
              className={`
                w-full btn btn-primary py-2 text-lg font-semibold rounded-lg transition flex items-center justify-center gap-2
                ${
                  isButtonDisabled
                    ? "bg-blue-400 cursor-not-allowed opacity-80"
                    : ""
                }
              `}
              disabled={isButtonDisabled}
            >
              {isLoginLoading ? (
                <>
                  <LoadingRing size={20} stroke={3} speed={2} color="white" />
                  Đang đăng nhập...
                </>
              ) : loginAttemptsInfo.isLocked ? (
                `Thử lại sau (${loginAttemptsInfo.remainingTime} phút)`
              ) : (
                "Đăng Nhập"
              )}
            </button>
            <span className="text-xs">Vui lòng chờ các Node khởi động.</span>
            <StatusServer />
          </form>
        </div>
        <FloatingNotification />
      </div>
    </>
  );
};

export default Login;
