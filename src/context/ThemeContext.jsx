import React, { createContext, useEffect, useState } from "react";
import Loading from "../components/Loading";

export const ThemeContext = createContext();

const getThemeColor = (theme) => {
  return theme === "dark" ? "#1f2937" : "#ffffff";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
    document.documentElement.setAttribute("data-theme", storedTheme);
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    // Cập nhật biến CSS
    document.documentElement.style.setProperty(
      "--theme-color",
      getThemeColor(newTheme)
    );
  };

  if (!isMounted) {
    return <Loading />;
  }

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
