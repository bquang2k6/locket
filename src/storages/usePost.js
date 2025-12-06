import { useState } from "react";

export const defaultPostOverlay = {
  overlay_id: "standard",
  color_top: "",
  color_bottom: "",
  text_color: "#FFFFFF",
  icon: "",
  caption: "",
  type: "default",
};

export const usePost = () => {
  const [selectedColors, setSelectedColors] = useState({
    top: "", // Trong suốt
    bottom: "", // Trong suốt
    text: "#FFFFFF",
    // type: "none"
  });
  const [postOverlay, setPostOverlay] = useState(defaultPostOverlay);

  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isTextColor, setTextColor] = useState(null);
  const [isSizeMedia, setSizeMedia] = useState(null);
  // Image cropping state (holds image URL to be cropped)
  const [imageToCrop, setImageToCrop] = useState(null);

  const [recentPosts, setRecentPosts] = useState(() => {
    const saved = localStorage.getItem("uploadedMoments");
    return saved ? JSON.parse(saved) : [];
  });

  const [audience, setAudience] = useState("all"); // "all" | "selected"
  const [selectedRecipients, setSelectedRecipients] = useState([]); // array userId hoặc object bạn bè
  
  // Add selectedFriendUid state
  const [selectedFriendUid, setSelectedFriendUid] = useState(null);
  
  // Add selectedMoment and selectedQueue states
  const [selectedMoment, setSelectedMoment] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState(null);

  return {
    caption,
    setCaption,
    selectedColors,
    setSelectedColors,
    selectedFile,
    setSelectedFile,
    preview,
    setPreview,
  imageToCrop,
  setImageToCrop,
    isTextColor,
    setTextColor,
    isSizeMedia,
    setSizeMedia,
    postOverlay,
    setPostOverlay,
    recentPosts,
    setRecentPosts,
    audience,
    setAudience,
    selectedRecipients,
    setSelectedRecipients,
    selectedFriendUid,
    setSelectedFriendUid,
    selectedMoment,
    setSelectedMoment,
    selectedQueue,
    setSelectedQueue,
  };
};
