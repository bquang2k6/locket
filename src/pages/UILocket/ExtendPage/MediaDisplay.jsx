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

  // Ref để theo dõi trạng thái camera
  const cameraInitialized = useRef(false);
  const lastCameraMode = useRef(cameraMode);
  const lastCameraHD = useRef(iscameraHD);

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
    try {
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

      // Dừng camera cũ nếu có thay đổi cấu hình
      if (
        streamRef.current &&
        (lastCameraMode.current !== cameraMode ||
          lastCameraHD.current !== iscameraHD)
      ) {
        stopCamera();
        // Thêm delay nhỏ để đảm bảo camera cũ đã dừng hoàn toàn
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Cấu hình video constraints
      let videoConstraints = {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        facingMode: cameraMode || "user",
      };

      const isUser = cameraMode === "user";
      const isZoom05 = zoomLevel === "0.5x";

      if (!(isUser && isZoom05)) {
        videoConstraints = {
          ...videoConstraints,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          aspectRatio: 1 / 1,
        };
      }

      // Chỉ yêu cầu quyền truy cập khi thực sự cần
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
        // Đảm bảo video được load
        await new Promise((resolve) => {
          if (videoRef.current.readyState >= 2) {
            resolve();
          } else {
            videoRef.current.onloadeddata = resolve;
          }
        });
      }

      console.log("🎥 Camera khởi động thành công");
    } catch (err) {
      console.error("🚫 Không thể truy cập camera:", err);
      setCameraActive(false);
      cameraInitialized.current = false;
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
    if (cameraActive && !preview && !selectedFile && !capturedMedia) {
      startCamera();
    } else if (!cameraActive || preview || selectedFile || capturedMedia) {
      // Chỉ dừng camera khi thực sự cần thiết
      if (streamRef.current && (preview || selectedFile || capturedMedia)) {
        stopCamera();
      }
    }

    // Cleanup khi component unmount
    return () => {
      if (!preview && !selectedFile && !capturedMedia) {
        // Chỉ cleanup nếu không có media đang hiển thị
        stopCamera();
      }
    };
  }, [
    cameraActive,
    cameraMode,
    iscameraHD,
    preview,
    selectedFile,
    capturedMedia,
  ]);

  // Effect để bật lại camera khi không có media
  useEffect(() => {
    if (!preview && !selectedFile && !capturedMedia && !cameraActive) {
      // console.log("✅ Không có media -> Bật lại camera");
      setCameraActive(true);
    }
  }, [preview, selectedFile, capturedMedia, setCameraActive, cameraActive]);

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
        setTimeout(() => {
          setCameraActive(true);
          setIsSwitchingCamera(false);
        }, 150);
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
        setTimeout(() => {
          setCameraActive(true);
        }, 150);
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