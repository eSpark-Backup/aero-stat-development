import React from 'react';
import "../../styles/test2.css";
import { calculateSkyLandPercentage } from '../../utils';
import lines from "../../assets/lines2.svg";
import meter from "../../assets/meter2.png";
import meter2 from "../../assets/meter3.png";
import stand from "../../assets/stand.png";


const NewRollMeter = () => {
    const roll = 0;
    const { sky, land } = calculateSkyLandPercentage(0);

    return (
        <div className="radar-container">
            <div style={{ transform: `rotate(${roll}deg)` }} className="radar">
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
                <div className="blue-box">
                    <div className="meter-lines"><img src={meter} /></div>
                </div>
                <div className="meter-lines2"><img src={meter2} /></div>
            </div>
            <div className="lines">
                <img src={lines} />
            </div>
        </div>
    );
};

export default NewRollMeter;
