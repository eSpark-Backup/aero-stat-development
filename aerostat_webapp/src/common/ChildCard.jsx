import React, { useContext } from "react";
import { ThemeContext } from "../ThemeHandler";

const ChildCard = ({ children, className = "", style }) => {  // Accept className and style
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={`child-card ${
        theme === "light" ? "child-card-light" : "child-card-dark"
      } ${className}`} // Append custom class
      style={style} // Apply inline styles
    >
      {children}
    </div>
  );
};

export default ChildCard;
