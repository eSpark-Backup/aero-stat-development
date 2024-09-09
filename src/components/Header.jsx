import React, { useState } from 'react'
import { ThemeContext } from '../ThemeHandler';

const Header = () => {
    const { theme, toggleTheme } = React.useContext(ThemeContext);
    return (
        <div className={`header ${theme}`}>
            <h1>LOGO Here</h1>
            <div className={`switch-container ${theme === "light" ? "light" : "dark"}`} onClick={toggleTheme}>
                <div className="switch">
                    <div className="icon">
                        {theme === "light" ? (
                            <span className="sun-icon">☀️</span>
                        ) : (
                            <span className="moon-icon">🌙</span>
                        )}
                    </div>
                    <span className="label">{theme === "light" ? "Light" : "Dark"}</span>
                </div>
            </div>
        </div>
    )
}

export default Header
