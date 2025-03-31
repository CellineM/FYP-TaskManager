// context/ThemeContext.js
import React, { createContext, useState, useContext } from "react";
import { Appearance } from "react-native";

// to hold the theme state and function
const ThemeContext = createContext();

export const useMode = () => useContext(ThemeContext);

// defining the colour for both light and dark mode
const lightModeColour = {
  background: "#fff0f6",
  text: "#000",
  tabBar: "#fff",
  active: "#007AFF",
  inactive: "gray",
};

const darkModeColour = {
  background: "#2C1B47",
  text: "#fff",
  tabBar: "#1C1133",
  active: "#9E8CC2",
  inactive: "#bbb",
};

// provide the theme to the entire application
export const ThemeMode = ({ children }) => {
  // the colour preference of the user whether light or dark mode
  const systemColorScheme = Appearance.getColorScheme();
  const [mode, isMode] = useState(systemColorScheme || "light");

  // it will function between these 2 mode
  const toggleMode = () => {
    isMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const colors = mode === "light" ? lightModeColour : darkModeColour;

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
