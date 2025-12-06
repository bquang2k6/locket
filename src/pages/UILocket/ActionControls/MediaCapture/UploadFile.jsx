import React, { useCallback, useContext } from "react";
import { useApp } from "../../../../context/AppContext";
import { AuthContext } from "../../../../context/AuthLocket";
import { showToast } from "../../../../components/Toast";
import { validateFileSize } from "../../../../utils/limitValidation";
import { ImageUp } from "lucide-react";

const UploadFile = () => {
  const { post, useloading, camera } = useApp();
  const { user, userPlan } = useContext(AuthContext);
  const { selectedFile, setSelectedFile, preview, setPreview, setSizeMedia, imageToCrop, setImageToCrop } =
    post;
  const { uploadLoading, setUploadLoading, setIsCaptionLoading } = useloading;
  const { cameraActive, setCameraActive } = camera;

  //Handle tải file
  const handleFileChange = useCallback(async (event) => {
    setCameraActive(false);
    setSelectedFile(null);
    const rawFile = event.target.files[0];
    if (!rawFile) return;
    const localPreviewUrl = URL.createObjectURL(rawFile);
    const fileType = rawFile.type.startsWith("image/")
      ? "image"
      : rawFile.type.startsWith("video/")
      ? "video"
      : null;

    if (!fileType) {
      showToast("error", "Chỉ hỗ trợ ảnh và video.");
      return;
    }

    // Validate file size against user plan limits
    const sizeValidation = validateFileSize(rawFile, userPlan);
    if (!sizeValidation.valid) {
      showToast("error", sizeValidation.message);
      URL.revokeObjectURL(localPreviewUrl);
      return;
    }

    // If image, open cropper first
    if (fileType === "image") {
      setImageToCrop(localPreviewUrl);
      return; // Cropper component will set selectedFile and preview after cropping
    }

    setPreview({ type: fileType, data: localPreviewUrl });

    if (fileType === "video") {
      try {
        const duration = await new Promise((resolve, reject) => {
          const video = document.createElement("video");
          video.preload = "metadata";
          video.src = localPreviewUrl;
          video.onloadedmetadata = () => {
            resolve(video.duration);
            video.remove();
          };
          video.onerror = () => {
            reject(new Error("Video không hợp lệ."));
            video.remove();
          };
        });

        if (duration > 10) {
          showToast("error", "Video quá dài. Vui lòng chọn video có kích thước nhỏ hơn 10s.");
          URL.revokeObjectURL(localPreviewUrl);
          return;
        }
      } catch (error) {
        showToast("error", error.message);
        URL.revokeObjectURL(localPreviewUrl);
        return;
      }
    }

    const fileSizeInMB = rawFile.size / (1024 * 1024);
    setSizeMedia(fileSizeInMB.toFixed(2));
    setIsCaptionLoading(true);
    setSelectedFile(rawFile);
  }, []);
  return (
    <>
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <ImageUp size={35} />
      </label>
    </>
  );
};
export default UploadFile;
