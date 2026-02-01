import { useContext } from "react";
import { AuthContext } from "../../../context/AuthLocket";
import { ChevronLeft, Menu } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import BadgePlan from "./Badge";
import Rollcall from "../../Public/Rollcall/ImageCardStack"

const RightHomeScreen = () => {
  const { user, setUser } = useContext(AuthContext);
  const { navigation } = useApp();

  const { isHomeOpen, setIsHomeOpen, setIsSidebarOpen } = navigation;
  // Khóa / Mở cuộn ngang khi mở sidebar
  // useEffect(() => {
  //   document.body.classList.toggle("overflow-hidden", isHomeOpen);
  //   return () => document.body.classList.remove("overflow-hidden");
  // }, [isHomeOpen]);

  return (
    <div
      className={`fixed inset-0 flex flex-col transition-transform duration-500 z-50 bg-base-100 ${isHomeOpen ? "translate-x-0" : "translate-x-full"
        } overflow-hidden`} // ❌ Không cuộn div to
    >
      {/* Nội dung */}

      <Rollcall />

    </div>
  );
};

export default RightHomeScreen;
