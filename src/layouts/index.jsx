import LocketLayout from "./locketLayout";
import DefaultLayout from "./mainLayout";


const getLayout = (pathname) => {
  // Sử dụng LocketLayout (không có header/footer) cho trang locket và chat
  if (pathname === "/locket" || pathname === "/chat") {
    return LocketLayout;
  }
  return DefaultLayout;
};

export default getLayout;
