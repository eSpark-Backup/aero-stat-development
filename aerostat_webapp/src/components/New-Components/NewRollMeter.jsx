import React, { useContext } from 'react';
import "../../styles/test2.css";
import { calculateSkyLandPercentage } from '../../utils';
import lines from "../../assets/lines2.svg";
import meter2 from "../../assets/meter3.png";
import stand from "../../assets/stand.png";
import { ThemeContext } from '../../ThemeHandler';


const NewRollMeter = ({ roll, pitch }) => {
    const { sky, land } = calculateSkyLandPercentage(pitch);
    const { theme, toggleTheme } = useContext(ThemeContext);


    return (
        <div className={`radar-container ${theme == "light" ? "radar-container-light" : "radar-container-dark"}`}>
            <div className="blue-box">
                <div className="meter-lines"><img src={meter2} /></div>
            </div>
            <div style={{ transform: `rotate(${roll}deg)`, transformOrigin: '50% 50%' }} className="radar">
                <div style={{ height: `${sky}%` }} className="sky"></div>
                <div
                    style={{
                        top: `${sky}%`,
                        transform: `translateY(calc(-${sky}% - 2px)) translateX(-50%)`,
                    }}
                    className="sun"
                >
                    <img src={stand} alt="Stand" className='stand' />
                </div>
                <div style={{ height: `${land}%` }} className="land"></div>
                <div className="red-arrow"></div>
            </div>
            <div className="meter-lines2"><img src={meter2} /></div>
            <div className="lines">
                <img src={lines} />
            </div>
        </div>


    );
};

export default NewRollMeter;
