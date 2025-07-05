import React, { useContext, useState, useEffect } from "react";

import { AuthContext } from "../../context/AuthLocket.jsx";

import LeftHomeScreen from "./ExtendPage/leftHomeScreen.jsx";
import RightHomeScreen from "./ExtendPage/rightHomeScreen.jsx";
import MainHomeScreen from "./ExtendPage/mainHomeScreen.jsx";

import BottomHomeScreen from "./ExtendPage/bottomHomeScreen.jsx";
import Sidebar from "../../components/Sidebar/index.jsx";
import FriendsContainer from "./ExtendPage/Container/FriendsContainer.jsx";
import ScreenCustomeStudio from "./ExtendPage/Container/CustomeStudio.jsx";

const CameraCapture = () => {
  const { user, setUser } = useContext(AuthContext);
  const [renderKey, setRenderKey] = useState(0);

  // Force re-render to ensure unique keys
  useEffect(() => {
    const timer = setInterval(() => {
      setRenderKey(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <React.Fragment key={`camera-capture-${renderKey}`}>
      <div key="main-home-screen">
        <MainHomeScreen />
      </div>
      {/* left */}
      <div key="left-home-screen">
        <LeftHomeScreen />
      </div>
      {/* right */}
      <div key="right-home-screen">
        <RightHomeScreen />
      </div>
      {/* Cái này là giao diện phía dưới chứa các bài viết đã hoặc đăng */}
      <div key="bottom-home-screen">
        <BottomHomeScreen />
      </div>

      <div key="custome-studio">
        <ScreenCustomeStudio />
      </div>

      <div key="friends-container">
        <FriendsContainer />
      </div>

      <div key="sidebar">
        <Sidebar />
      </div>
    </React.Fragment>
  );
};

export default CameraCapture;
