import { useEffect } from "react";

export default function Ads() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.log("AdSense error:", e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "inline-block", width: "300px", height: "250px" }}
      data-ad-client="ca-pub-1905437736346974"
      data-ad-slot="5128836736"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
}
