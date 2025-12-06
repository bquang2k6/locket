import React, { useCallback, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { useApp } from "../../context/AppContext";
import { Scissors, X } from "lucide-react";
import { getCroppedImg } from "../../utils/process/PrsImage/cropImage";

const CropImageStudio = () => {
  const {
    selectedFile,
    setSelectedFile,
    preview,
    setPreview,
    isSizeMedia,
    setSizeMedia,
    imageToCrop,
    setImageToCrop,
  } = useApp().post;
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropConfirm = useCallback(async () => {
    if (!croppedAreaPixels || !imageToCrop) return;

    try {
      const croppedFile = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const localPreviewUrl = URL.createObjectURL(croppedFile);

      setSelectedFile(croppedFile); // ✅ Lưu file gửi lên server
      setPreview({ type: "image", data: localPreviewUrl });
      const fileSizeInMB = croppedFile.size / (1024 * 1024);
      setSizeMedia(fileSizeInMB.toFixed(2));

      // Revoke the original object URL if it was an object URL
      try {
        if (imageToCrop && imageToCrop.startsWith && imageToCrop.startsWith("blob:")) {
          URL.revokeObjectURL(imageToCrop);
        }
      } catch (e) {
        // ignore
      }

      setImageToCrop(null); // ✅ Ẩn cropper sau khi cắt
    } catch (e) {
      console.error("Crop failed", e);
    }
  }, [croppedAreaPixels, imageToCrop]);

  // Effect để reset crop và zoom khi có ảnh mới
  useEffect(() => {
    if (imageToCrop) {
      setCrop({ x: 0, y: 0 });
      setZoom(1); // Reset zoom về 1 để ảnh lấp đầy khung
    }
  }, [imageToCrop]);

  const [showCropper, setShowCropper] = useState(false);

  // Mỗi khi imageToCrop thay đổi, xử lý hiệu ứng mở/đóng
  useEffect(() => {
    if (imageToCrop) {
      setShowCropper(true); // Mở cropper
    } else {
      // Đóng cropper sau hiệu ứng (300ms)
      const timer = setTimeout(() => setShowCropper(false), 300);
      return () => clearTimeout(timer);
    }
  }, [imageToCrop]);

  //Khoá cuộn màn hình cho thẻ body
  useEffect(() => {
    if (imageToCrop) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [imageToCrop]);

  return (
    <>
      {showCropper && (
        <div
            className={`fixed inset-0 z-50
                backdrop-blur-2xl bg-black/40
                transition-all duration-500 ease-in-out
                ${imageToCrop ? "opacity-100" : "opacity-0 pointer-events-none"}
                flex flex-col`}
            >
            {/* Cropper Area */}
            <div className="flex-1 h-[calc(100vh-180px)] flex items-center justify-center relative">
                <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedAreaPixels) =>
                    setCroppedAreaPixels(croppedAreaPixels)
                }
                cropShape="rect"
                showGrid={false}
                zoomWithScroll={true}
                objectFit="contain"
                restrictPosition={true}
                style={{
                    containerStyle: {
                    width: "100%",
                    height: "100%",
                    },
                }}
                />
            </div>

            {/* Footer */}
            <div
                className="w-full px-5 py-5 backdrop-blur-xl bg-white/2000
                shadow-2xl rounded-t-3xl border-t border-white/20
                transition-all duration-300"
            >
                <h1 className="text-lg font-semibold text-white text-center">
                ✂️ Crop Image
                </h1>
                <p className="text-xs text-center text-gray-300 mt-1">
                Kéo ảnh hoặc zoom để chọn vùng
                </p>

                <div className="flex justify-center gap-4 mt-4">
                <button
                    onClick={() => setImageToCrop(null)}
                    className="px-5 py-2 rounded-xl bg-white/10 text-white border border-white/20
                    hover:bg-white/20 transition"
                >
                    Cancel
                </button>

                <button
                    onClick={handleCropConfirm}
                    className="px-5 py-2 rounded-xl bg-blue-100 text-black
                    hover:bg-blue-600 transition"
                >
                    Crop
                </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default CropImageStudio;
