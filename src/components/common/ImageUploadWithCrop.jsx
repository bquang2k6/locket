import React from "react";
import { useApp } from "../../context/AppContext";

const ImageUploadWithCrop = ({ accept = "image/*", className = "" }) => {
  const { setImageToCrop } = useApp().post;

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // Create object URL for cropping preview
    const url = URL.createObjectURL(file);
    setImageToCrop(url);
  };

  return (
    <input
      type="file"
      accept={accept}
      onChange={handleFileChange}
      className={className}
    />
  );
};

export default ImageUploadWithCrop;
