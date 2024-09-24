import React from 'react';
import "../../src/test2.css";
import lines2 from "../assets/lines2.svg"
import { calculateSkyLandPercentage } from '../utils';
import meter from "../assets/meter2.png";
import stand from "../assets/stand.png";


const NewRollMeter = () => {
    const roll = 0.5;
    const { sky, land } = calculateSkyLandPercentage(2);

    return (
        <div className="radar-container">
            <div style={{ transform: `rotate(${roll}deg)` }} className="radar">
                <div style={{ height: `${sky}%` }} className="sky">
                    <img src={meter} alt="" />
                </div>

                <div style={{ height: `${land}%` }} className="land">
                    <img src={meter} alt="" className='land-meter' />
                    <img src={stand} alt="" className='land-stand' />
                </div>
                <div className="red-arrow"></div>
            </div>

            <div className="lines">
                <img src={lines2} />
            </div>
        </div>
    );
};

export default NewRollMeter;
