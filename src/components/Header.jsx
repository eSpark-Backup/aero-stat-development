import React, { useState } from 'react'
import { ThemeContext } from '../ThemeHandler';
import sun from "../assets/sun.png";
import moon from "../assets/moon.png";

const Header = () => {
    const { theme, toggleTheme } = React.useContext(ThemeContext);
    return (
        <div className={`header ${theme}`}>
            <h1>LOGO Here</h1>
            <div className={`switch-container ${theme === "light" ? "light" : "dark"}`} onClick={toggleTheme}>
                <div className="switch">
                    <div className="icon">
                        {theme === "light" ? (
                            <img src={sun} alt="sun" />
                        ) : (
                            <img src={moon} alt="sun" />
                        )}
                    </div>
                    <span className="label">{theme === "light" ? "Light" : "Dark"}</span>
                </div>
            </div>
        </div>
    )
}

export default Header
