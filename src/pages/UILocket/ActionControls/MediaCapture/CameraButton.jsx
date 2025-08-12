// import React, { useEffect, useRef } from "react";
// import { useApp } from "../../../../context/AppContext";
// import { RefreshCcw } from "lucide-react";
// import * as constant from "../../../../constants";
// import UploadFile from "./UploadFile";

// //const MAX_RECORD_TIME = 10; // giây

// const CameraButton = () => {
//   const { camera, post, useloading } = useApp();
//   const {
//     videoRef,
//     streamRef,
//     canvasRef,
//     cameraRef,
//     rotation,
//     isHolding,
//     setIsHolding,
//     permissionChecked,
//     setPermissionChecked,
//     holdTime,
//     setHoldTime,
//     setRotation,
//     cameraMode,
//     setCameraMode,
//     cameraActive,
//     setCameraActive,
//     setLoading,
//   } = camera;
//   const { preview, setPreview, setSelectedFile, setSizeMedia } = post;
//   const { setIsCaptionLoading, uploadLoading, setUploadLoading } = useloading;

//   const holdStartTimeRef = useRef(null);
//   const holdTimeoutRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const intervalRef = useRef(null);

//   // useEffect(() => {
//   //   console.log("🎬 Trạng thái isHolding thay đổi:", isHolding);
//   // }, [isHolding]);
//   const stopCamera = () => {
//     if (videoRef.current && videoRef.current.srcObject) {
//       videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
//     }
//   };
//   // Function để kiểm tra môi trường PWA
//   const isPWA = () => {
//     if (
//       window.matchMedia &&
//       window.matchMedia("(display-mode: standalone)").matches
//     ) {
//       return true;
//     }
//     if (window.navigator.standalone === true) {
//       return true;
//     }
//     if (document.referrer.includes("android-app://")) {
//       return true;
//     }
//     const userAgent = window.navigator.userAgent.toLowerCase();
//     if (userAgent.includes("wv") || userAgent.includes("webview")) {
//       return true;
//     }
//     return false;
//   };
//   const startHold = (e) => {
//     // if (e && e.preventDefault) e.preventDefault(); // Đã comment để tránh lỗi passive event listener
//     holdStartTimeRef.current = Date.now();
//     holdTimeoutRef.current = setTimeout(() => {
//       setIsHolding(true);
//       const video = videoRef.current;
//       if (!video) return;
//       const canvas = document.createElement("canvas");
//       const ctx = canvas.getContext("2d");
//       const side = Math.min(video.videoWidth, video.videoHeight);
//       const outputSize = 1080;
//       canvas.width = outputSize;
//       canvas.height = outputSize;
//       // Ưu tiên 60fps nếu hỗ trợ, fallback 30fps
//       let targetFPS = 60;
//       try {
//         const testStream = canvas.captureStream(60);
//         if (!testStream) targetFPS = 30;
//       } catch {
//         targetFPS = 30;
//       }
//       const canvasStream = canvas.captureStream(targetFPS);
//       // Chọn MIME phù hợp
//       let mimeType = isPWA() ? "video/mp4" : "video/webm";
//       if (!MediaRecorder.isTypeSupported(mimeType)) {
//         mimeType = "video/webm";
//         if (!MediaRecorder.isTypeSupported(mimeType)) {
//           mimeType = "";
//         }
//       }
//       const recorderOptions = mimeType ? { mimeType } : {};
//       recorderOptions.videoBitsPerSecond = isPWA() ? 1500000 : 2500000;
//       const recorder = new MediaRecorder(canvasStream, recorderOptions);
//       mediaRecorderRef.current = recorder;
//       const chunks = [];
//       recorder.ondataavailable = (e) => {
//         if (e.data.size > 0) chunks.push(e.data);
//       };
//       recorder.onstop = async () => {
//         setCameraActive(false);
//         const finalMimeType = mimeType || "video/mp4";
//         const blob = new Blob(chunks, { type: finalMimeType });
//         const extension = finalMimeType.includes("webm") ? "webm" : "mp4";
//         const file = new File([blob], `locket_dio.${extension}`, {
//           type: finalMimeType,
//         });
//         const videoUrl = URL.createObjectURL(file);
//         const fileSizeInMB = file.size / (1024 * 1024);
//         setSizeMedia(fileSizeInMB.toFixed(2));
//         setPreview({ type: "video", data: videoUrl });
//         setSelectedFile(file);
//         setCameraActive(false);
//         setIsCaptionLoading(true);
//         stopCamera();
//         setLoading(false);
//         setIsHolding(false);
//       };
//       recorder.onerror = (e) => {
//         setIsHolding(false);
//       };
//       try {
//         recorder.start();
//       } catch (error) {
//         setIsHolding(false);
//         return;
//       }
//       let lastFrameTime = 0;
//       const frameInterval = isPWA() ? 1000 / 45 : 0;
//       const drawFrame = (currentTime) => {
//         if (video.paused || video.ended || recorder.state !== "recording") {
//           return;
//         }
//         if (isPWA() && currentTime - lastFrameTime < frameInterval) {
//           if (recorder.state === "recording") {
//             requestAnimationFrame(drawFrame);
//           }
//           return;
//         }
//         lastFrameTime = currentTime;
//         ctx.save();
//         if (cameraMode === "user") {
//           ctx.translate(outputSize, 0);
//           ctx.scale(-1, 1);
//         }
//         const sx = (video.videoWidth - side) / 2;
//         const sy = (video.videoHeight - side) / 2;
//         ctx.drawImage(video, sx, sy, side, side, 0, 0, outputSize, outputSize);
//         ctx.restore();
//         if (recorder.state === "recording") {
//           requestAnimationFrame(drawFrame);
//         }
//       };
//       requestAnimationFrame(drawFrame);
//       setTimeout(() => {
//         if (recorder.state === "recording") {
//           recorder.stop();
//           setIsHolding(false);
//         }
//       }, 10000);
//     }, 600);
//   };

//   const endHold = () => {
//     const heldTime = Date.now() - holdStartTimeRef.current;
//     clearTimeout(holdTimeoutRef.current);
//     setIsHolding(false);
//     clearInterval(intervalRef.current);
//     setHoldTime(heldTime);
//     if (heldTime < 300) {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
//       if (!video || !canvas) return;
//       if (video.readyState < 2) {
//         return;
//       }
//       const ctx = canvas.getContext("2d");
//       canvas.width = 1920;
//       canvas.height = 1920;
//       let sx = 0,
//         sy = 0,
//         sw = video.videoWidth,
//         sh = video.videoHeight;
//       if (video.videoWidth > video.videoHeight) {
//         const offset = (video.videoWidth - video.videoHeight) / 2;
//         sx = offset;
//         sw = video.videoHeight;
//       } else {
//         const offset = (video.videoHeight - video.videoWidth) / 2;
//         sy = offset;
//         sh = video.videoWidth;
//       }
//       if (cameraMode === "user") {
//         ctx.translate(canvas.width, 0);
//         ctx.scale(-1, 1);
//       }
//       ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
//       canvas.toBlob((blob) => {
//         if (blob) {
//           const file = new File([blob], "locket_dio.jpg", {
//             type: "image/jpeg",
//           });
//           const imgUrl = URL.createObjectURL(file);
//           setPreview({ type: "image", data: imgUrl });
//           const fileSizeInMB = file.size / (1024 * 1024);
//           setSizeMedia(fileSizeInMB.toFixed(2));
//           setSelectedFile(file);
//           setIsCaptionLoading(true);
//           setCameraActive(false);
//         }
//       }, "image/jpeg", 1.0);
//     } else {
//       if (mediaRecorderRef.current?.state === "recording") {
//         mediaRecorderRef.current.stop();
//       }
//     }
//     setTimeout(() => {
//       const videoEl = document.querySelector("video");
//       if (videoEl) videoEl.setAttribute("playsinline", "true");
//     }, 100);
//   };

//   const handleRotateCamera = async () => {
//     setRotation((prev) => prev + 180);
//     const newMode = cameraMode === "user" ? "environment" : "user";
//     setCameraMode(newMode);
//     setCameraActive(false);
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//       streamRef.current = null;
//       // Thêm delay nhỏ để giải phóng tài nguyên camera
//       await new Promise(res => setTimeout(res, 300));
//     }
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: newMode,
//           width: { ideal: 1920 },
//           height: { ideal: 1080 },
//           aspectRatio: 1 / 1,
//         },
//         audio: false,
//       });
//       streamRef.current = stream;
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.onloadedmetadata = () => {
//           setTimeout(() => setCameraActive(true), 500);
//         };
//         setTimeout(() => {
//           if (!cameraActive) setCameraActive(true);
//         }, 1000);
//       }
//     } catch (error) {
//       if (error.name === "NotReadableError") {
//         alert("Không thể truy cập camera. Hãy đảm bảo không có ứng dụng nào khác đang sử dụng camera và thử lại.");
//       }
//       setCameraActive(true);
//     }
//   };

//   return (
//     <>
//       <div className="flex gap-4 w-full h-25 max-w-md justify-evenly items-center">
//         <UploadFile />
//         <button
//           onMouseDown={startHold}
//           onMouseUp={endHold}
//           onMouseLeave={endHold}
//           onTouchStart={startHold}
//           onTouchEnd={endHold}
//           className="relative flex items-center justify-center w-22 h-22"
//         >
//           <div
//             className={`absolute w-22 h-22 border-5 border-base-content/50 rounded-full z-10 ${
//               isHolding ? "animate-lightPulse" : ""
//             }`}
//           ></div>
//           <div
//             className={`absolute rounded-full btn w-18 h-18 outline-accent bg-base-content z-0 ${
//               isHolding ? "animate-pulseBeat" : ""
//             }`}
//           ></div>
//         </button>
//         <button className="cursor-pointer" onClick={handleRotateCamera}>
//           <RefreshCcw
//             size={35}
//             className="transition-transform duration-500"
//             style={{ transform: `rotate(${rotation}deg)` }}
//           />
//         </button>
//       </div>
//     </>
//   );
// };

// export default CameraButton;



import React, { useEffect, useRef } from "react";
import { useApp } from "../../../../context/AppContext";
import { RefreshCcw } from "lucide-react";
import * as constant from "../../../../constants";
import UploadFile from "./UploadFile";

const CameraButton = () => {
  const { camera, post, useloading } = useApp();
  const {
    videoRef,
    streamRef,
    canvasRef,
    cameraRef,
    rotation,
    isHolding,
    setIsHolding,
    permissionChecked,
    setPermissionChecked,
    holdTime,
    setHoldTime,
    setRotation,
    cameraMode,
    setCameraMode,
    cameraActive,
    setCameraActive,
    setLoading,
  } = camera;
  const { preview, setPreview, setSelectedFile, setSizeMedia } = post;
  const { setIsCaptionLoading, uploadLoading, setUploadLoading } = useloading;

  const holdStartTimeRef = useRef(null);
  const holdTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const intervalRef = useRef(null);

  // Detect device capabilities
  const getDeviceCapabilities = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /ipad|iphone|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = isIOS || isAndroid;
    
    // Detect high-end devices
    const isHighEnd = navigator.hardwareConcurrency >= 4 && 
                     navigator.deviceMemory >= 4;
    
    return { isIOS, isAndroid, isMobile, isHighEnd };
  };

  // Function để kiểm tra môi trường PWA
  const isPWA = () => {
    if (
      window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      return true;
    }
    if (window.navigator.standalone === true) {
      return true;
    }
    if (document.referrer.includes("android-app://")) {
      return true;
    }
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes("wv") || userAgent.includes("webview")) {
      return true;
    }
    return false;
  };

  // Get optimal settings based on device
  const getOptimalSettings = () => {
    const { isIOS, isAndroid, isMobile, isHighEnd } = getDeviceCapabilities();
    const isPWAMode = isPWA();

    let settings = {
      targetFPS: 60,
      drawingFPS: 60,
      bitrate: 4000000, // 4 Mbps
      outputSize: 1080,
      mimeType: 'video/webm;codecs=vp9',
      quality: 1.0
    };

    // iOS optimizations
    if (isIOS) {
      settings.targetFPS = 30; // iOS Safari thường hạn chế 30fps
      settings.mimeType = 'video/mp4'; // iOS prefer MP4
      settings.bitrate = 3000000; // Lower bitrate for iOS
      settings.drawingFPS = 30;
    }

    // Android optimizations
    if (isAndroid) {
      settings.targetFPS = isHighEnd ? 60 : 30;
      settings.drawingFPS = isHighEnd ? 45 : 30;
      settings.bitrate = isHighEnd ? 4000000 : 2500000;
    }

    // PWA optimizations
    if (isPWAMode) {
      settings.targetFPS = Math.min(settings.targetFPS, 30);
      settings.drawingFPS = Math.min(settings.drawingFPS, 30);
      settings.bitrate = Math.min(settings.bitrate, 2500000);
    }

    // Low-end device fallback
    if (!isHighEnd && isMobile) {
      settings.targetFPS = 30;
      settings.drawingFPS = 30;
      settings.bitrate = 2000000;
      settings.outputSize = 720; // Lower resolution for performance
    }

    console.log('🎥 Optimal settings:', settings);
    return settings;
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  const startHold = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    holdStartTimeRef.current = Date.now();
    holdTimeoutRef.current = setTimeout(() => {
      setIsHolding(true);
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const settings = getOptimalSettings();
      
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", {
        alpha: false, // Better performance
        desynchronized: true // Better performance for animations
      });
      
      const side = Math.min(video.videoWidth, video.videoHeight);
      canvas.width = settings.outputSize;
      canvas.height = settings.outputSize;

      // Try to get the best possible stream
      let canvasStream;
      try {
        canvasStream = canvas.captureStream(settings.targetFPS);
      } catch (error) {
        console.warn('Failed to set FPS, using default:', error);
        canvasStream = canvas.captureStream();
      }

      // Enhanced MIME type detection with fallbacks
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus', 
        'video/webm;codecs=h264',
        'video/webm',
        'video/mp4;codecs=h264',
        'video/mp4'
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      console.log('🎥 Selected MIME type:', selectedMimeType);

      const recorderOptions = {
        mimeType: selectedMimeType,
        videoBitsPerSecond: settings.bitrate,
        bitsPerSecond: settings.bitrate
      };

      // Remove empty mimeType to let browser choose
      if (!selectedMimeType) {
        delete recorderOptions.mimeType;
      }

      const recorder = new MediaRecorder(canvasStream, recorderOptions);
      mediaRecorderRef.current = recorder;

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        setCameraActive(false);
        
        if (chunks.length === 0) {
          console.error('No video data captured');
          setIsHolding(false);
          return;
        }

        const finalMimeType = selectedMimeType || "video/mp4";
        const blob = new Blob(chunks, { type: finalMimeType });
        
        // Get proper extension
        let extension = "mp4";
        if (finalMimeType.includes("webm")) extension = "webm";
        else if (finalMimeType.includes("ogg")) extension = "ogg";
        
        const file = new File([blob], `locket_dio.${extension}`, {
          type: finalMimeType,
        });

        console.log('📹 Video created:', {
          size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
          type: file.type,
          duration: `${((Date.now() - holdStartTimeRef.current) / 1000).toFixed(1)}s`
        });

        const videoUrl = URL.createObjectURL(file);
        const fileSizeInMB = file.size / (1024 * 1024);

        setSizeMedia(fileSizeInMB.toFixed(2));
        setPreview({ type: "video", data: videoUrl });
        setSelectedFile(file);
        setCameraActive(false);
        setIsCaptionLoading(true);
        stopCamera();
        setLoading(false);
        setIsHolding(false);
      };

      recorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        setIsHolding(false);
      };

      try {
        recorder.start(100); // Collect data every 100ms for smoother recording
      } catch (error) {
        console.error('Failed to start recording:', error);
        setIsHolding(false);
        return;
      }

      // Enhanced frame drawing with adaptive quality
      let lastFrameTime = 0;
      let frameCount = 0;
      let fpsStartTime = performance.now();
      const frameInterval = 1000 / settings.drawingFPS;

      const drawFrame = (currentTime) => {
        if (video.paused || video.ended || recorder.state !== "recording") {
          return;
        }

        // FPS control
        if (currentTime - lastFrameTime < frameInterval) {
          if (recorder.state === "recording") {
            requestAnimationFrame(drawFrame);
          }
          return;
        }

        // FPS monitoring
        frameCount++;
        if (frameCount % 30 === 0) {
          const currentFPS = (30 * 1000) / (currentTime - fpsStartTime);
          console.log(`🎬 Current drawing FPS: ${currentFPS.toFixed(1)}`);
          fpsStartTime = currentTime;
        }

        lastFrameTime = currentTime;

        // Enhanced drawing with better quality
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (cameraMode === "user") {
          ctx.translate(settings.outputSize, 0);
          ctx.scale(-1, 1);
        }

        const sx = (video.videoWidth - side) / 2;
        const sy = (video.videoHeight - side) / 2;
        
        ctx.drawImage(
          video, 
          sx, sy, side, side, 
          0, 0, settings.outputSize, settings.outputSize
        );

        ctx.restore();

        if (recorder.state === "recording") {
          requestAnimationFrame(drawFrame);
        }
      };

      requestAnimationFrame(drawFrame);

      // Auto stop with better timing
      setTimeout(() => {
        if (recorder.state === "recording") {
          console.log('📹 Auto stopping recording after 10s');
          recorder.stop();
        }
      }, 10000);
    }, 600);
  };

  const endHold = () => {
    const heldTime = Date.now() - holdStartTimeRef.current;
    clearTimeout(holdTimeoutRef.current);
    setIsHolding(false);
    clearInterval(intervalRef.current);
    setHoldTime(heldTime);

    if (heldTime < 300) {
      // Enhanced image capture
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      if (video.readyState < 2) {
        console.warn('Video not ready for capture');
        return;
      }

      const ctx = canvas.getContext("2d", {
        alpha: false,
        desynchronized: true
      });
      
      // Higher resolution for images
      const imageSize = 1920;
      canvas.width = imageSize;
      canvas.height = imageSize;

      let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;

      // Center crop to square
      if (video.videoWidth > video.videoHeight) {
        const offset = (video.videoWidth - video.videoHeight) / 2;
        sx = offset;
        sw = video.videoHeight;
      } else {
        const offset = (video.videoHeight - video.videoWidth) / 2;
        sy = offset;
        sh = video.videoWidth;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (cameraMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "locket_dio.jpg", {
            type: "image/jpeg",
          });
          const imgUrl = URL.createObjectURL(file);
          setPreview({ type: "image", data: imgUrl });
          const fileSizeInMB = file.size / (1024 * 1024);
          setSizeMedia(fileSizeInMB.toFixed(2));
          setSelectedFile(file);
          setIsCaptionLoading(true);
          setCameraActive(false);

          console.log('📸 Image captured:', {
            size: `${fileSizeInMB.toFixed(2)}MB`,
            resolution: `${imageSize}x${imageSize}`
          });
        }
      }, "image/jpeg", 0.95); // Slightly reduce quality for smaller file size
    } else {
      // Stop video recording
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    }

    // iOS fix with better timing
    setTimeout(() => {
      const videoEl = document.querySelector("video");
      if (videoEl) {
        videoEl.setAttribute("playsinline", "true");
        videoEl.setAttribute("muted", "true");
      }
    }, 100);
  };

  const handleRotateCamera = async () => {
    setRotation((prev) => prev + 180);
    const newMode = cameraMode === "user" ? "environment" : "user";
    setCameraMode(newMode);
    setCameraActive(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      await new Promise(res => setTimeout(res, 300));
    }

    try {
      // Enhanced camera constraints
      const constraints = {
        video: {
          facingMode: newMode,
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1920, min: 1280 },
          frameRate: { ideal: 30, min: 15 },
          aspectRatio: 1.0
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log('📹 Camera stream ready:', {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
            facingMode: newMode
          });
          setTimeout(() => setCameraActive(true), 500);
        };

        setTimeout(() => {
          if (!cameraActive) setCameraActive(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Camera error:', error);
      if (error.name === "NotReadableError") {
        alert("Không thể truy cập camera. Hãy đảm bảo không có ứng dụng nào khác đang sử dụng camera và thử lại.");
      }
      setCameraActive(true);
    }
  };

  // Log device info on mount
  useEffect(() => {
    const capabilities = getDeviceCapabilities();
    const settings = getOptimalSettings();
    console.log('🚀 Device capabilities:', capabilities);
    console.log('⚙️ Applied settings:', settings);
  }, []);

  return (
    <>
      <div className="flex gap-4 w-full h-25 max-w-md justify-evenly items-center">
        <UploadFile />
        <button
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={startHold}
          onTouchEnd={endHold}
          className="relative flex items-center justify-center w-22 h-22"
        >
          <div
            className={`absolute w-22 h-22 border-5 border-base-content/50 rounded-full z-10 ${
              isHolding ? "animate-lightPulse" : ""
            }`}
          ></div>
          <div
            className={`absolute rounded-full btn w-18 h-18 outline-accent bg-base-content z-0 ${
              isHolding ? "animate-pulseBeat" : ""
            }`}
          ></div>
        </button>
        <button className="cursor-pointer" onClick={handleRotateCamera}>
          <RefreshCcw
            size={35}
            className="transition-transform duration-500"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        </button>
      </div>
    </>
  );
};

export default CameraButton;