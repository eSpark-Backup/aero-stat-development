import React from 'react';
import "../../styles/test.css";

const getDirection = (degree) => {
    if (degree === 0 || degree === 360) return "N";
    if (degree > 0 && degree < 45) return "N-E";
    if (degree === 45) return "NE";
    if (degree > 45 && degree < 90) return "E-NE";
    if (degree === 90) return "E";
    if (degree > 90 && degree < 135) return "E-SE";
    if (degree === 135) return "SE";
    if (degree > 135 && degree < 180) return "S-SE";
    if (degree === 180) return "S";
    if (degree > 180 && degree < 225) return "S-SW";
    if (degree === 225) return "SW";
    if (degree > 225 && degree < 270) return "W-SW";
    if (degree === 270) return "W";
    if (degree > 270 && degree < 315) return "W-NW";
    if (degree === 315) return "NW";
    if (degree > 315 && degree < 360) return "N-NW";
    return "Unknown";
};

const NewCompass = () => {
    const degrees = [...Array(12)].map((_, i) => `${i * 30}°`);
    const needleRotation = 270;
    const needleRotation2 = 100;
    const direction = getDirection(needleRotation);

    return (
        <div>
            <div className="compass">
                <div className="center-main-circle">
                    <div className="center-circle">
                        <span className="degree">
                            {needleRotation}°
                        </span>
                        <span className="direction">
                            {direction}
                        </span>
                    </div>
                    <div
                        className="needle"
                        style={{
                            transform: `rotate(${needleRotation}deg) translate(-50%, -50%)`,
                        }}
                    ></div>
                    {needleRotation2 && <div
                        className="needle2"
                        style={{
                            transform: `rotate(${needleRotation2}deg) translate(-50%, -50%)`,
                        }}
                    ></div>}
                </div>

                <div className="line-container">
                    {/* Render lines */}
                    {[...Array(24)].map((_, i) => (
                        <div
                            key={i}
                            className="line"
                            style={{
                                height: i % 2 === 0 ? '10.05px' : '4px',
                                transform: `rotate(${i * 15}deg) translateY(-85px)`
                            }}
                        ></div>
                    ))}

                    {/* Render degree labels */}
                    {degrees.map((degree, i) => (
                        <div
                            key={i}
                            className="degree-label"
                            style={{
                                position: 'absolute',
                                transform: `rotate(${i * 30}deg) translateY(-74px)`,
                                textAlign: 'center',
                                width: '30px',
                                fontSize: degree === "0°" || degree === "90°" || degree === "180°" || degree === "270°" ? "14px" : "16px",
                                fontWeight: degree === "0°" || degree === "90°" || degree === "180°" || degree === "270°" ? "500" : "400",
                            }}
                        >
                            {degree}
                        </div>
                    ))}
                    <div className="direction-label" style={{ transform: 'rotate(6.5deg) translateY(-118px)' }}>
                        <p style={{ transform: 'rotate(-8.5deg) translateX(8px)', fontSize: "24px", fontWeight: "500", color: "#F60000" }}>N</p>
                    </div>
                    <div className="direction-label" style={{ transform: 'rotate(90deg) translateY(-128px)' }}>
                        <p style={{ fontSize: "24px", fontWeight: "500", }}>E</p>
                    </div>
                    <div className="direction-label" style={{ transform: 'rotate(180deg) translateY(-118px)' }}>
                        <p style={{ transform: "translateX(3px)", fontSize: "24px", fontWeight: "500" }}>S</p>
                    </div>
                    <div className="direction-label" style={{ transform: 'rotate(270deg) translateY(-138px) translateX(-2px)', fontSize: "24px", fontWeight: "500" }}>
                        <p>W</p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default NewCompass;
