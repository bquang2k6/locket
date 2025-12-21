// src/context/AppContext.jsx
import React, { createContext, useContext, useState } from "react";
import { useNavigation } from "../storages/useNavigation";
import { useCamera } from "../storages/useCamera";
import { useLoading } from "../storages/useLoading";
import { usePost } from "../storages/usePost";
import { useThemes } from "../storages/useThemes";
import { ModalState } from "../storages/ModalState";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigation = useNavigation();
  const camera = useCamera();
  const useloading = useLoading();
  const post = usePost();
  const captiontheme = useThemes();
  const modal = ModalState();
  const [isLiquidGlassTaskbarVisible, setIsLiquidGlassTaskbarVisible] = useState(true);

  // console.log("AppProvider post keys:", Object.keys(post));

  return (
    <AppContext.Provider
      value={{
        navigation,
        camera,
        useloading, 
        post,
        captiontheme,
        modal,
        isLiquidGlassTaskbarVisible,
        setIsLiquidGlassTaskbarVisible,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
