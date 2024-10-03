import React, { useContext } from 'react'
import logo from "../../assets/logo.svg"
import logowhite from "../../assets/logo-white.svg"
import { ThemeContext } from '../../ThemeHandler';

const Header = ({ time }) => {
    const { theme } = useContext(ThemeContext);

    const dateString = time ? time : 'Thu, 3 October 2024, 17:01:29';
    const date = new Date(dateString);

    // Get the day name
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const day = date.toLocaleDateString('en-US', options);

    // Get the time components
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    console.log(hours + ":" + minutes + ":" + seconds);
    return (
        <div className='header'>
            <div className={`logo ${theme === "light" ? "logo-light" : "logo-dark"}`}>
                <img src={theme === "light" ? logo : logowhite} alt="Logo" />
            </div>
            <div className={`header-details ${theme === "light" ? "header-details-light" : "header-details-dark"}`}>
                <div>
                    <h2 className={`data-type ${theme === "light" ? "data-type-light" : "data-type-dark"}`}>Live Data:</h2>
                    <div className={`day ${theme === "light" ? "day-light" : "day-dark"}`}>
                        <h2>{day}</h2>
                    </div>
                </div>
                <div>
                    <div className='time-box'>
                        <div className={`time ${theme === "light" ? "time-light" : "time-dark"}`}>
                            <h3>{hours[0]}</h3>
                        </div>
                        <div className={`time ${theme === "light" ? "time-light" : "time-dark"}`}>
                            <h3>{hours[1]}</h3>
                        </div>
                    </div>
                    <div className="colon-box">
                        <div className={`colon ${theme === "light" ? "colon-light" : "colon-dark"}`}></div>
                        <div className={`colon ${theme === "light" ? "colon-light" : "colon-dark"}`}></div>
                    </div>
                    <div className='time-box'>
                        <div className={`time ${theme === "light" ? "time-light" : "time-dark"}`}>
                            <h3>{minutes[0]}</h3>
                        </div>
                        <div className={`time ${theme === "light" ? "time-light" : "time-dark"}`}>
                            <h3>{minutes[1]}</h3>
                        </div>
                    </div>
                    <div className="colon-box">
                        <div className={`colon ${theme === "light" ? "colon-light" : "colon-dark"}`}></div>
                        <div className={`colon ${theme === "light" ? "colon-light" : "colon-dark"}`}></div>
                    </div>
                    <div className='time-box'>
                        <div className={`time ${theme === "light" ? "time-light" : "time-dark"}`}>
                            <h3>{seconds[0]}</h3>
                        </div>
                        <div className={`time ${theme === "light" ? "time-light" : "time-dark"}`}>
                            <h3>{seconds[1]}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header
