import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../utils";

const sortByOrderIndex = (themes) => {
  return [...themes].sort(
    (a, b) => (a.order_index ?? 9999) - (b.order_index ?? 9999)
  );
};

const groupThemesByType = (themes) => {
  return {
    decorative: sortByOrderIndex(themes.filter((t) => t.type === "decorative")),
    custome: sortByOrderIndex(themes.filter((t) => t.type === "custome")),
    background: sortByOrderIndex(themes.filter((t) => t.type === "background")),
    image_icon: sortByOrderIndex(themes.filter((t) => t.type === "image_icon")),
  };
};

export const useThemes = () => {
  const [captionThemes, setCaptionThemes] = useState({
    decorative: [],
    custome: [],
    background: [],
    image_icon: [],
  });

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        // Luôn gọi API mỗi lần load lại trang
        const { data } = await axios.get(API_URL.GET_CAPTION_THEMES);
        
        // Group dữ liệu
        const groupedThemes = groupThemesByType(data);
        
        // Cập nhật state
        setCaptionThemes(groupedThemes);
        
      } catch (error) {
        console.error("Lỗi khi fetch themes:", error);
      }
    };

    fetchThemes();
  }, []);

  return { captionThemes };
};