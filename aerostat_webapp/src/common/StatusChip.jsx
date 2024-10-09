import React, { useContext } from 'react'
import { ThemeContext } from '../ThemeHandler';

const StatusChip = ({ color, description }) => {
    const { theme } = useContext(ThemeContext);

    return (
        <div className={`${theme === "light" && color === "green" ? "status-chip-green-light" : theme === "dark" && color === "green" ? "status-chip-green-dark" : theme === "light" ? "status-chip-light" : "status-chip-dark"}`}>
            <div className={`status ${color === "red" || color === "blue" || color === "green" ? "light-" + color : ""}`} style={{ background: description === "Disconnected" ? "red" : "" }}></div>
            <div
                className={`status-desc 
  ${color === "red" || color === "blue" || color === "green" ? "light-" + color + "-text" : ""} 
  ${theme === "dark" && color === "red" || theme === "dark" && color === "blue" ? "dark-" + color + "-text" : ""}`
                }
            >
                <p style={{ color: description === "Disconnected" ? "red" : "" }}>{description}</p>
            </div>
        </div>
    )
}

export default StatusChip
