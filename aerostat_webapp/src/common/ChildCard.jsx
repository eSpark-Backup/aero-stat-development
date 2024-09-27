import React, { useContext } from 'react'
import { ThemeContext } from '../ThemeHandler';

const ChildCard = ({ children }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`child-card ${theme === "light" ? "child-card-light" : "child-card-dark"}`}>
      {children}
    </div>
  )
}

export default ChildCard
