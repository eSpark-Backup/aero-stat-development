import React from 'react'
import logo from "../../assets/logo.svg"

const Header = () => {
    return (
        <div className='header'>
            <div className="logo">
                <img src={logo} alt="Logo" />
            </div>
            <div className="header-details">
                <div>
                    <h2 className='data-type'>Live Data:</h2>
                    <div className="day">
                        <h2>Friday, 30 August 2024</h2>
                    </div>
                </div>
                <div>
                    <div className='time-box'>
                        <div className="time">
                            <h3>0</h3>
                        </div>
                        <div className="time">
                            <h3>7</h3>
                        </div>
                    </div>
                    <div className="colon-box">
                        <div className="colon"></div>
                        <div className="colon"></div>
                    </div>
                    <div className='time-box'>
                        <div className="time">
                            <h3>1</h3>
                        </div>
                        <div className="time">
                            <h3>5</h3>
                        </div>
                    </div>
                    <div className="colon-box">
                        <div className="colon"></div>
                        <div className="colon"></div>
                    </div>
                    <div className='time-box'>
                        <div className="time">
                            <h3>1</h3>
                        </div>
                        <div className="time">
                            <h3>5</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header
