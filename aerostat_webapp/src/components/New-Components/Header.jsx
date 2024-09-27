import React, { useContext } from 'react'
import logo from "../../assets/logo (2).svg"
import logowhite from "../../assets/logo-white.svg"
import { ThemeContext } from '../../ThemeHandler';

const Header = () => {
    const { theme } = useContext(ThemeContext);
    return (
        <div className='header'>
            <div className={`logo ${theme === "light" ? "logo-light" : "logo-dark"}`}>
                <img src={theme === "light" ? logo : logowhite} alt="Logo" />
            </div>
            <div className={`header-details ${theme === "light" ? "header-details-light" : "header-details-dark"}`}>
                <div>
                    <h2 className={`data-type ${theme === "light" ? "data-type-light" : "data-type-dark"}`}>Live Data:</h2>
                    <div className={`day ${theme === "light" ? "day-light" : "day-dark"}`}>
                        <h2>Friday, 30 August 2024</h2>
                    </div>
                </div>
                <div>
                    <div className='time-box'>
                        <div className={`time ${theme === "light" ? "time-light" : "time-dark"}`}>
                            <h3>0</h3>
                        </div>
                        <div className={`time ${theme === "light" ? "time-light" : "time-dark"}`}>
                            <h3>7</h3>
                        </div>
                    </div>
                    <div className="colon-box">
                        <div className={`colon ${theme === "light" ? "colon-light" : "colon-dark"}`}></div>
                        <div className={`colon ${theme === "light" ? "colon-light" : "colon-dark"}`}></div>
                    </div>
                    <div className='time-box'>
                        <div className={`time ${theme === "light" ? "time-light" : "time-dark"}`}>
                            <h3>1</h3>
                        </div>
                        <div className={`time ${theme === "light" ? "time-light" : "time-dark"}`}>
                            <h3>5</h3>
                        </div>
                    </div>
                    <div className="colon-box">
                        <div className={`colon ${theme === "light" ? "colon-light" : "colon-dark"}`}></div>
                        <div className={`colon ${theme === "light" ? "colon-light" : "colon-dark"}`}></div>
                    </div>
                    <div className='time-box'>
                        <div className={`time ${theme === "light" ? "time-light" : "time-dark"}`}>
                            <h3>1</h3>
                        </div>
                        <div className={`time ${theme === "light" ? "time-light" : "time-dark"}`}>
                            <h3>5</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header
