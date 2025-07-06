import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AutoResizeCaption from "./AutoResizeCaption";
import { useApp } from "../../../context/AppContext";
import MediaSizeInfo from "../../../components/UI/MediaSizeInfo";
import BorderProgress from "../../../components/UI/SquareProgress";
import { showInfo } from "../../../components/Toast";
import { AuthContext } from "../../../context/AuthLocket";
import Cropper from "react-easy-crop";
import { getAvailableCameras, getCroppedImg } from "../../../utils";
import { Zap } from "lucide-react";

const MediaPreview = ({ capturedMedia }) => {
  console.log("🎥 MediaDisplay component loaded - version 2.0");
  const { userPlan } = useContext(AuthContext);
  const { post, useloading, camera } = useApp();
  const { selectedFile, setSelectedFile, preview, isSizeMedia } = post;
  const {
    streamRef,
    videoRef,
    cameraActive,
    setCameraActive,
    cameraMode,
    setCameraMode,
    iscameraHD,
    setIsCameraHD,
    zoomLevel,
    setZoomLevel,
    deviceId,
    setDeviceId,
  } = camera;
  const { isCaptionLoading, uploadLoading, sendLoading, setSendLoading } =
    useloading;
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);

  // Ref để theo dõi trạng thái camera
  const cameraInitialized = useRef(false);
  const lastCameraMode = useRef(cameraMode);
  const lastCameraHD = useRef(iscameraHD);
  const lastStartTime = useRef(0);

  // Hàm dừng camera được tối ưu
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    cameraInitialized.current = false;
  };

  // Hàm khởi động camera được tối ưu
  const startCamera = async () => {
    // Tránh khởi động camera nhiều lần cùng lúc
    if (isStartingCamera) {
      console.log("🔄 Đang khởi động camera, bỏ qua lần gọi này");
      return;
    }

    // Tránh khởi động camera quá thường xuyên
    const now = Date.now();
    if (now - lastStartTime.current < 2000) {
      console.log("🔄 Khởi động camera quá thường xuyên, bỏ qua");
      return;
    }

    try {
      setIsStartingCamera(true);
      lastStartTime.current = now;
      
      // Kiểm tra xem có đang có media không
      if (preview || selectedFile || capturedMedia) {
        console.log("📱 Có media đang hiển thị, không khởi động camera");
        return;
      }

      // Kiểm tra xem camera có đang hoạt động không
      if (streamRef.current?.active && videoRef.current?.srcObject && videoRef.current?.readyState >= 2) {
        console.log("🎥 Camera đang hoạt động bình thường");
        return;
      }

      // Nếu camera đã được khởi tạo và chế độ không thay đổi, không cần khởi tạo lại
      if (
        cameraInitialized.current &&
        streamRef.current &&
        lastCameraMode.current === cameraMode &&
        lastCameraHD.current === iscameraHD
      ) {
        // Chỉ cần gán lại stream vào video element
        if (videoRef.current && !videoRef.current.srcObject) {
          videoRef.current.srcObject = streamRef.current;
        }
        return;
      }



      // Dừng camera cũ nếu có thay đổi cấu hình hoặc camera không hoạt động
      if (
        streamRef.current &&
        (lastCameraMode.current !== cameraMode ||
          lastCameraHD.current !== iscameraHD ||
          !videoRef.current?.srcObject)
      ) {
        console.log("🔄 Dừng camera cũ để khởi động camera mới");
        stopCamera();
        // Thêm delay nhỏ để đảm bảo camera cũ đã dừng hoàn toàn
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Sử dụng cấu hình cơ bản để tránh lỗi NotReadableError
      let videoConstraints = {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        facingMode: cameraMode || "user",
        // Chỉ sử dụng cấu hình cơ bản - cực kỳ đơn giản
      };

      // Nếu không có deviceId, chỉ sử dụng facingMode
      if (!deviceId) {
        videoConstraints = {
          facingMode: cameraMode || "user",
        };
      }

      console.log("🎥 Đang khởi động camera với cấu hình:", videoConstraints);

      // Khởi động camera với cấu hình cơ bản (không có retry logic)
      console.log("🎥 Khởi động camera với cấu hình cơ bản - NO RETRY");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      streamRef.current = stream;
      cameraInitialized.current = true;
      lastCameraMode.current = cameraMode;
      lastCameraHD.current = iscameraHD;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Đảm bảo video được load với timeout dài hơn
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            console.log("⚠️ Timeout loading video, nhưng vẫn tiếp tục...");
            resolve(); // Không reject, chỉ log warning
          }, 10000); // Tăng timeout lên 10 giây

          const checkReadyState = () => {
            if (videoRef.current.readyState >= 2) {
              clearTimeout(timeout);
              resolve();
            } else {
              // Kiểm tra lại sau 100ms
              setTimeout(checkReadyState, 100);
            }
          };

          // Bắt đầu kiểm tra
          checkReadyState();

          // Backup event listeners
          videoRef.current.onloadeddata = () => {
            clearTimeout(timeout);
            resolve();
          };
          
          videoRef.current.oncanplay = () => {
            clearTimeout(timeout);
            resolve();
          };
          
          videoRef.current.onerror = () => {
            clearTimeout(timeout);
            console.warn("Video load error, nhưng vẫn tiếp tục...");
            resolve(); // Không reject, chỉ log warning
          };
        });
      }

      console.log("🎥 Camera khởi động thành công");
    } catch (err) {
      console.error("🚫 Không thể truy cập camera (NO RETRY):", err);
      cameraInitialized.current = false;
      
      // Hiển thị thông báo lỗi cho người dùng
      if (err.name === 'NotReadableError') {
        showInfo("Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng ứng dụng khác và thử lại.");
      } else if (err.name === 'NotAllowedError') {
        showInfo("Quyền truy cập camera bị từ chối. Vui lòng cấp quyền truy cập camera.");
      } else {
        showInfo("Không thể truy cập camera. Vui lòng kiểm tra lại thiết bị.");
      }
      
      setCameraActive(false);
    } finally {
      setIsStartingCamera(false);
    }
  };

  // Effect để reset crop và zoom khi có ảnh mới
  useEffect(() => {
    if (preview?.type === "image") {
      setCrop({ x: 0, y: 0 });
      setZoom(1); // Reset zoom về 1 để ảnh lấp đầy khung
    }
  }, [preview?.data]);

  // Effect chính để quản lý camera
  useEffect(() => {
    console.log("🎥 Effect: Camera state changed", { 
      cameraActive, 
      hasPreview: !!preview, 
      hasSelectedFile: !!selectedFile, 
      hasCapturedMedia: !!capturedMedia,
      isStartingCamera 
    });
    
    // Chỉ khởi động camera khi thực sự cần thiết
    if (cameraActive && !preview && !selectedFile && !capturedMedia && !isStartingCamera) {
      console.log("🎥 Effect: Khởi động camera với delay");
      // Thêm delay nhỏ để tránh conflict
      setTimeout(() => {
        startCamera();
      }, 100);
    } else if (!cameraActive || preview || selectedFile || capturedMedia) {
      // Chỉ dừng camera khi thực sự cần thiết
      if (streamRef.current && (preview || selectedFile || capturedMedia)) {
        console.log("🎥 Effect: Dừng camera vì có media");
        stopCamera();
      }
    }

    // Cleanup khi component unmount
    return () => {
      console.log("🎥 Effect: Cleanup - dừng camera");
      stopCamera();
    };
  }, [
    cameraActive,
    cameraMode,
    iscameraHD,
    deviceId,
    preview,
    selectedFile,
    capturedMedia,
  ]);

  // Effect để bật lại camera khi không có media
  useEffect(() => {
    if (!preview && !selectedFile && !capturedMedia && !cameraActive) {
      console.log("✅ Không có media -> Bật lại camera");
      setCameraActive(true);
    }
  }, [preview, selectedFile, capturedMedia, setCameraActive, cameraActive]);

  // Tạm thời tắt logic kiểm tra camera để tránh loop vô hạn
  // useEffect(() => {
  //   let retryCount = 0;
  //   const maxRetries = 1;
  //   let isRetrying = false;
  //   let lastCheckTime = 0;

  //   const checkCameraStatus = () => {
  //     const now = Date.now();
      
  //     if (now - lastCheckTime < 3000) {
  //       return;
  //     }
      
  //     if (cameraActive && !preview && !selectedFile && !capturedMedia && !isRetrying) {
  //       lastCheckTime = now;
        
  //       const hasStream = streamRef.current && streamRef.current.active;
  //       const hasVideoSrc = videoRef.current?.srcObject;
  //       const videoReady = videoRef.current?.readyState >= 2;

  //       console.log("🔍 Kiểm tra camera:", { hasStream, hasVideoSrc, videoReady });

  //       if (!hasStream || !hasVideoSrc || !videoReady) {
  //         retryCount++;
  //         console.log(`🔄 Camera không hoạt động (lần thử ${retryCount}/${maxRetries}), khởi động lại...`);
          
  //         if (retryCount <= maxRetries) {
  //           isRetrying = true;
  //           startCamera().finally(() => {
  //             isRetrying = false;
  //           });
  //         } else {
  //           console.log("⚠️ Đã thử khởi động camera nhiều lần, dừng thử lại");
  //           clearInterval(interval);
  //         }
  //       } else {
  //         if (retryCount > 0) {
  //           console.log("✅ Camera đã hoạt động bình thường, reset retry count");
  //           retryCount = 0;
  //         }
  //       }
  //     }
  //   };

  //   const interval = setInterval(checkCameraStatus, 8000);
    
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [cameraActive, preview, selectedFile, capturedMedia]);

  const handleChangeCamera = () => {
    setIsCameraHD((prev) => !prev);
  };

  const [croppedImage, setCroppedImage] = useState(null);

  const handleCropComplete = useCallback(
    async (_, croppedAreaPixels) => {
      try {
        const croppedFile = await getCroppedImg(
          preview?.data,
          croppedAreaPixels
        );
        setCroppedImage(URL.createObjectURL(croppedFile)); // Hiển thị preview
        setSelectedFile(croppedFile); // ✅ Lưu file để gửi lên server
      } catch (e) {
        console.error(e);
      }
    },
    [preview?.data]
  );
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    if (preview?.type === "image" && preview.data) {
      const img = new Image();
      img.onload = () => {
        const ratio = img.height;
        setAspectRatio(ratio);
      };
      img.src = preview.data;
    }
  }, [preview?.data]);

  // Hàm chuyển đổi camera trước/sau
  const handleSwitchCamera = async () => {
    if (isSwitchingCamera) return; // Tránh spam click
    
    try {
      setIsSwitchingCamera(true);
      const cameras = await getAvailableCameras();
      const isBackCamera = cameraMode === "environment";
      const isFrontCamera = cameraMode === "user";

      let newCameraMode = "user";
      let newDeviceId = null;

      if (isFrontCamera) {
        // Chuyển từ camera trước sang camera sau
        newCameraMode = "environment";
        newDeviceId = cameras?.backNormalCamera?.deviceId || cameras?.backCameras?.[0]?.deviceId;
      } else if (isBackCamera) {
        // Chuyển từ camera sau sang camera trước
        newCameraMode = "user";
        newDeviceId = cameras?.frontCameras?.[0]?.deviceId;
      }

      if (newDeviceId) {
        // Cập nhật camera mode và device ID
        setCameraMode(newCameraMode);
        setDeviceId(newDeviceId);
        setZoomLevel("1x"); // Reset zoom về 1x khi chuyển camera
        
        // Khởi động lại camera với delay nhỏ để tránh màn hình đen
        setCameraActive(false);
        setTimeout(async () => {
          setCameraActive(true);
          // Đợi một chút rồi khởi động camera
          setTimeout(() => {
            startCamera();
          }, 100);
          setIsSwitchingCamera(false);
        }, 200);
      } else {
        showInfo("Không tìm thấy camera phù hợp để chuyển đổi");
        setIsSwitchingCamera(false);
      }
    } catch (error) {
      console.error("Lỗi khi chuyển đổi camera:", error);
      showInfo("Không thể chuyển đổi camera");
      setIsSwitchingCamera(false);
    }
  };

  // Hàm chuyển đổi zoom camera
  const handleCycleZoomCamera = async () => {
    try {
      const cameras = await getAvailableCameras();
      const isBackCamera = cameraMode === "environment";
      const isFrontCamera = cameraMode === "user";

      let newZoom = "1x";
      let newDeviceId = null;

      if (isFrontCamera) {
        // Camera trước chỉ có 1x và 0.5x
        if (zoomLevel === "1x") {
          newZoom = "0.5x";
          newDeviceId = cameras?.frontCameras?.[0]?.deviceId;
        } else {
          newZoom = "1x";
          newDeviceId = cameras?.frontCameras?.[0]?.deviceId;
        }
      } else if (isBackCamera) {
        // Camera sau có nhiều zoom levels
        if (zoomLevel === "1x") {
          newZoom = "0.5x";
          newDeviceId = cameras?.backUltraWideCamera?.deviceId;
        } else if (zoomLevel === "0.5x") {
          newZoom = "3x";
          newDeviceId = cameras?.backZoomCamera?.deviceId;
        } else if (zoomLevel === "3x") {
          newZoom = "1x";
          newDeviceId = cameras?.backNormalCamera?.deviceId;
        }

        // Fallback nếu không tìm thấy camera phù hợp
        if (!newDeviceId && zoomLevel !== "1x") {
          newZoom = "1x";
          newDeviceId = cameras?.backNormalCamera?.deviceId;
        }
      }

      if (newDeviceId) {
        setZoomLevel(newZoom);
        setDeviceId(newDeviceId);
        
        // Khởi động lại camera với delay nhỏ để tránh màn hình đen
        setCameraActive(false);
        setTimeout(async () => {
          setCameraActive(true);
          // Đợi một chút rồi khởi động camera
          setTimeout(() => {
            startCamera();
          }, 100);
        }, 200);
      } else {
        showInfo("Không tìm thấy camera phù hợp để chuyển zoom");
      }
    } catch (error) {
      console.error("Lỗi khi chuyển zoom camera:", error);
      showInfo("Không thể chuyển zoom camera");
    }
  };

  return (
    <>
      <h1 className="text-3xl mb-1.5 font-semibold font-lovehouse">
        Locket Camera
      </h1>

      <div
        className={`relative w-full max-w-md aspect-square bg-gray-800 rounded-[65px] overflow-hidden transition-transform duration-500 `}
      >
        {/* Hiển thị camera nếu chưa có media */}
        {!preview && !selectedFile && !capturedMedia && cameraActive && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`
              w-full h-full object-cover transition-all duration-500 ease-in-out
              ${cameraMode === "user" ? "scale-x-[-1]" : ""}
              ${
                cameraActive
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 pointer-events-none"
              }
            `}
            />
            
            {/* Nút khởi động lại camera nếu camera bị đen */}
            {(!streamRef.current?.active || !videoRef.current?.srcObject || videoRef.current?.readyState < 2) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="flex flex-col gap-3 items-center">
                  <button
                    onClick={() => {
                      console.log("🔄 Khởi động lại camera thủ công");
                      stopCamera();
                      cameraInitialized.current = false;
                      setTimeout(() => {
                        startCamera();
                      }, 500);
                    }}
                    className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-medium hover:bg-white/30 transition-all"
                  >
                    🔄 Khởi động lại camera
                  </button>
                  
                  <button
                    onClick={() => {
                      console.log("🔄 Reset camera hoàn toàn");
                      stopCamera();
                      cameraInitialized.current = false;
                      lastCameraMode.current = null;
                      lastCameraHD.current = null;
                      setCameraActive(false);
                      setTimeout(() => {
                        setCameraActive(true);
                      }, 1000);
                    }}
                    className="px-3 py-1.5 bg-red-500/20 backdrop-blur-md rounded-full text-red-300 text-sm font-medium hover:bg-red-500/30 transition-all"
                  >
                    🔄 Reset hoàn toàn
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {!preview && !selectedFile && (
          <div className="absolute inset-0 top-7 px-7 z-50 pointer-events-none flex justify-between text-base-content text-xs font-semibold">
            <button
              onClick={() => showInfo("Chức năng này sẽ sớm có mặt!")}
              className="pointer-events-auto w-7 h-7 p-1.5 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center"
            >
              <img src="/images/bolt.fill.png" alt="" />
            </button>

            <div className="flex gap-2">
              {/* Nút chuyển đổi camera trước/sau */}
              <button
                onClick={handleSwitchCamera}
                disabled={isSwitchingCamera}
                className={`pointer-events-auto w-8 h-8 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center transition-all duration-200 ${
                  isSwitchingCamera ? 'opacity-50 animate-pulse' : 'hover:bg-white/40'
                }`}
                title="Chuyển đổi camera"
              >
                {isSwitchingCamera ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 4v6h-6"/>
                    <path d="M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
                    <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/>
                  </svg>
                )}
              </button>

              {/* Nút zoom camera */}
              <button
                onClick={handleCycleZoomCamera}
                className="pointer-events-auto w-8 h-8 text-primary-content font-semibold rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center"
                title="Chuyển zoom"
              >
                {zoomLevel}
              </button>
            </div>
          </div>
        )}

        {/* Preview media */}
        {preview?.type === "video" && (
          <video
            src={preview.data}
            autoPlay
            loop
            muted
            playsInline
            className={`w-full h-full object-cover ${
              preview ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {preview?.type === "image" && (
          <img
            src={preview.data}
            alt="Preview"
            className={`w-full h-full object-cover select-none transition-all duration-300 ${
              preview ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Caption */}
        {preview && selectedFile && (
          <div
            className={`absolute z-10 inset-x-0 bottom-0 px-4 pb-4 transition-all duration-500 ${
              crop ? "opacity-100" : "opacity-0"
            }`}
          >
            <AutoResizeCaption />
          </div>
        )}

        {/* Viền loading */}
        <div className="absolute inset-0 z-50 pointer-events-none">
          <BorderProgress />
        </div>
      </div>

      {/* Media size info */}
      <div className="mt-2 text-sm flex items-center justify-center pl-3">
        <MediaSizeInfo />
      </div>
    </>
  );
};

export default MediaPreview;