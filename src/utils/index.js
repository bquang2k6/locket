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
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    const cameras = {
      frontCameras: [],
      backNormalCamera: null,
      backUltraWideCamera: null,
      backZoomCamera: null,
    };

    for (const device of videoDevices) {
      // Try to determine camera type based on label
      const label = device.label.toLowerCase();
      
      if (label.includes('front') || label.includes('user')) {
        cameras.frontCameras.push(device);
      } else if (label.includes('back') || label.includes('environment')) {
        if (label.includes('ultra') || label.includes('wide')) {
          cameras.backUltraWideCamera = device;
        } else if (label.includes('zoom') || label.includes('tele')) {
          cameras.backZoomCamera = device;
        } else {
          cameras.backNormalCamera = device;
        }
      }
    }

    // If we couldn't categorize, assign remaining cameras
    if (!cameras.backNormalCamera && videoDevices.length > 0) {
      cameras.backNormalCamera = videoDevices[0];
    }

    return cameras;
  } catch (error) {
    console.error('Error getting available cameras:', error);
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
