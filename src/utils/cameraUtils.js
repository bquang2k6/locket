// Hàm lấy danh sách camera có sẵn
export const getAvailableCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    const cameras = {
      frontCameras: [],
      backCameras: [],
      backNormalCamera: null,
      backUltraWideCamera: null,
      backZoomCamera: null,
    };

    // Phân loại camera dựa trên label
    videoDevices.forEach(device => {
      const label = device.label.toLowerCase();
      
      // Camera trước (front camera)
      if (label.includes('front') || label.includes('user') || label.includes('selfie')) {
        cameras.frontCameras.push(device);
      }
      // Camera sau (back camera)
      else if (label.includes('back') || label.includes('environment') || label.includes('rear')) {
        cameras.backCameras.push(device);
        
        // Phân loại camera sau theo loại
        if (label.includes('ultra') || label.includes('wide') || label.includes('0.5')) {
          cameras.backUltraWideCamera = device;
        } else if (label.includes('zoom') || label.includes('tele') || label.includes('3x')) {
          cameras.backZoomCamera = device;
        } else {
          // Camera thường (normal)
          cameras.backNormalCamera = device;
        }
      }
    });

    // Fallback: nếu không phân loại được, gán camera đầu tiên làm normal
    if (!cameras.backNormalCamera && cameras.backCameras.length > 0) {
      cameras.backNormalCamera = cameras.backCameras[0];
    }

    return cameras;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách camera:', error);
    return {
      frontCameras: [],
      backCameras: [],
      backNormalCamera: null,
      backUltraWideCamera: null,
      backZoomCamera: null,
    };
  }
};

// Hàm crop ảnh
export const getCroppedImg = async (imageSrc, pixelCrop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Không thể tạo canvas context'));
        return;
      }

      // Tính toán kích thước crop
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.drawImage(
        image,
        pixelCrop.x * scaleX,
        pixelCrop.y * scaleY,
        pixelCrop.width * scaleX,
        pixelCrop.height * scaleY,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      // Chuyển đổi thành blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Không thể tạo blob từ canvas'));
          }
        },
        'image/jpeg',
        0.95
      );
    };

    image.onerror = () => {
      reject(new Error('Không thể tải ảnh'));
    };
  });
}; 