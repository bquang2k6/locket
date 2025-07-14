export * from "./cookie/cookieUtils"; // Xuất tất cả hàm từ cookieUtils.js
export * from "./storage/helpers"; // Xuất tất cả hàm từ helpers.js
export * from "./cropImage"; // Xuất tất cả hàm từ cropimages.js
export * from "./API/apiRoutes"; // Xuất tất cả hàm từ apiRoutes.js
export * from "./payload/createPayload"; // Xuất tất cả hàm từ createPayload.js
export * from "./storage"
export * from "./standardize"
export * from "./auth"

// Camera utilities
export const getAvailableCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((d) => d.kind === "videoinput");
    const frontCameras = [];
    const backCameras = [];
    let backUltraWideCamera = null;
    let backNormalCamera = null;
    let backZoomCamera = null;
    videoDevices.forEach((device) => {
      const label = device.label.toLowerCase();
      if (/mặt trước|front|user|trước/.test(label)) {
        frontCameras.push(device);
      } else if (/mặt sau|back|rear|environment|sau/.test(label)) {
        backCameras.push(device);
        if (/cực rộng|ultra|0.5x|góc rộng/.test(label)) {
          backUltraWideCamera ??= device;
        } else if (/chụp xa|tele|zoom|2x|3x|5x/.test(label)) {
          backZoomCamera ??= device;
        } else if (
          /camera kép|camera|bình thường|1x|rộng/.test(label) &&
          !/cực rộng|chụp xa|zoom|tele/.test(label)
        ) {
          backNormalCamera ??= device;
        }
      }
    });
    return {
      allCameras: videoDevices,
      frontCameras,
      backCameras,
      backUltraWideCamera,
      backNormalCamera,
      backZoomCamera,
    };
  } catch (error) {
    console.error("Error getting available cameras:", error);
    return null;
  }
};

export const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  
  return new Promise((resolve) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const maxSize = Math.max(image.width, image.height);
      const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

      canvas.width = safeArea;
      canvas.height = safeArea;

      ctx.translate(safeArea / 2, safeArea / 2);
      ctx.translate(-safeArea / 2, -safeArea / 2);

      ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5
      );

      const data = ctx.getImageData(0, 0, safeArea, safeArea);

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.putImageData(
        data,
        0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
        0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
      );

      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    };
  });
};

