import React, { useContext } from 'react'
import { ThemeContext } from '../ThemeHandler';

const StatusChip = ({ color, description }) => {
    const { theme } = useContext(ThemeContext);

    return (
        <div className={`${color === "green" ? "status-chip-green" : "status-chip"}`}>
            <div className={`status ${color === "red" || color === "blue" || color === "green" ? "light-" + color : ""}`}></div>
            <div
                className={`status-desc 
  ${color === "red" || color === "blue" || color === "green" ? "light-" + color + "-text" : ""} 
  ${theme === "dark" && color === "red" || theme === "dark" && color === "blue" ? "dark-" + color + "-text" : ""}`
                }
            >
                <p>{description}</p>
            </div>
        </div>
    )
}

export default StatusChip
