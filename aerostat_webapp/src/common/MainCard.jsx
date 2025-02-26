import React, { useContext } from "react";
import { ThemeContext } from "../ThemeHandler";

const MainCard = ({ title, children, style }) => {
  const { theme } = useContext(ThemeContext);
  return (
    <div
      className={`main-card ${
        theme === "light" ? "main-card-light" : "main-card-dark"
      }`}
      style={style} // Apply style prop
    >
      <div
        className={`main-card-title ${
          theme === "light" ? "main-card-title-light" : "main-card-title-dark"
        }`}
      >
        <h1>{title}</h1>
      </div>
      {children}
    </div>
  );
};

export default MainCard;
