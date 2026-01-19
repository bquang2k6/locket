import { useEffect, useState } from "react";

function isHeic(url) {
  return /\.heic($|\?)/i.test(url);
}

export function useHeicImages(images) {
  const [resolved, setResolved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!images || images.length === 0) {
      setResolved([]);
      setLoading(false);
      return;
    }

    const mapped = images.map((url) =>
      isHeic(url)
        ? `https://code-push.wangtech.top/api/convert?url=${encodeURIComponent(url)}`
        : url
    );

    setResolved(mapped);
    setLoading(false);
  }, [images]);

  return { images: resolved, loading };
}
