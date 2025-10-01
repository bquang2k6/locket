import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Ads() {
  const location = useLocation();

  useEffect(() => {
    // Re-run adsbygoogle push whenever the route changes so AdSense can
    // initialize the ad unit in single-page-app navigation.
    try {
      // Delay slightly to ensure the <ins> element is in the DOM
      // (helps on some browsers / rendering scenarios).
      setTimeout(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }, 0);
    } catch (e) {
      console.log("AdSense error:", e);
    }
  }, [location.pathname]);

  // Use the pathname as key so the <ins> element remounts on navigation,
  // which helps AdSense detect the new ad slot correctly.
  return (
    <ins
      key={location.pathname}
      className="adsbygoogle"
      style={{ display: "inline-block", width: "300px", height: "250px" }}
      data-ad-client="ca-pub-1905437736346974"
      data-ad-slot="5128836736"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
}
