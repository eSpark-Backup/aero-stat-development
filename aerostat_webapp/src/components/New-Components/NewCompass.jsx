import React, { useContext } from "react";
import "../../styles/test.css";
import { ThemeContext } from "../../ThemeHandler";

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

const NewCompass = ({ size, needle1, needle2 }) => {
  const { theme, toggleTheme, phase } = useContext(ThemeContext);
  const degrees = [...Array(12)].map((_, i) => `${i * 30}°`);
  const needleRotation = needle1;
  const needleRotation2 = needle2;
  const direction1 = getDirection(needleRotation);

  return (
    <div>
      <div
        className={`compass ${
          theme === "light" ? "compass-light" : "compass-dark"
        }`}
      >
        <div
          className={`center-main-circle ${
            theme === "light"
              ? "center-main-circle-light"
              : "center-main-circle-dark"
          }`}
        >
          <div
            className={`center-circle ${
              theme === "light" ? "center-circle-light" : "center-circle-dark"
            }`}
          >
            {phase === 1 && (
              <span
                style={{
                  color:
                    theme === "light" && needle2
                      ? "#F30102"
                      : theme === "dark" && needle2
                      ? "#F30102"
                      : !needle2 && theme === "light"
                      ? "#47515C"
                      : "#F8F8F8",
                }}
              >
                <p style={{ fontWeight: "700", fontSize: "18px" }}>
                  {Number(needleRotation)?.toFixed(2)}°
                </p>
              </span>
            )}
            {!needle2 && (
              <span
                className={`direction ${
                  theme === "light" ? "direction-light" : "direction-dark"
                }`}
              >
                <p>{direction1}</p>
              </span>
            )}
            {needle2 && (
              <span className="degree2" style={{ color: "#4260FF" }}>
                <p>{Number(needleRotation2)?.toFixed(2)}°</p>
              </span>
            )}
          </div>
          {phase === 1 && (
            <div
              className="needle"
              style={{
                transform: `rotate(${needleRotation}deg) translate(-50%, -50%)`,
              }}
            ></div>
          )}
          {needle2 && (
            <div
              className="needle2"
              style={{
                transform: `rotate(${needleRotation2}deg) translate(-50%, -50%)`,
              }}
            ></div>
          )}
        </div>

        <div className="line-container">
          {/* Render lines */}
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="line"
              style={{
                height: i % 2 === 0 ? "10.05px" : "4px",
                transform: `rotate(${i * 15}deg) translateY(-85px)`,
              }}
            ></div>
          ))}

          {/* Render degree labels */}
          {degrees.map((degree, i) => (
            <div
              key={i}
              className={`degree-label ${
                theme === "light" ? "degree-label-light" : "degree-label-dark"
              }`}
              style={{
                position: "absolute",
                transform: `rotate(${i * 30}deg) translateY(-74px)`,
                textAlign: "center",
                width: "30px",
                fontSize:
                  degree === "0°" ||
                  degree === "90°" ||
                  degree === "180°" ||
                  degree === "270°"
                    ? "12px"
                    : "10px",
                fontWeight:
                  degree === "0°" ||
                  degree === "90°" ||
                  degree === "180°" ||
                  degree === "270°"
                    ? "700"
                    : "400",
              }}
            >
              {degree}
            </div>
          ))}
          <div
            className="direction-label"
            style={{ transform: "rotate(6.5deg) translateY(-118px)" }}
          >
            <p
              style={{
                transform: size
                  ? "rotate(-8.5deg) translateX(7px) translateY(7px)"
                  : "rotate(-8.5deg) translateX(12px)",
                fontSize: size ? "18px" : "24px",
                fontWeight: "500",
                color: "#F60000",
              }}
            >
              N
            </p>
          </div>
          <div
            className="direction-label"
            style={{ transform: "rotate(90deg) translateY(-128px)" }}
          >
            <p
              style={{
                fontSize: size ? "18px" : "24px",
                fontWeight: "500",
                color: theme === "light" ? "#47515C" : "#FFFFFF",
                transform: size
                  ? "rotate(-90deg) translate(-13px, 5px)"
                  : "rotate(-90deg)",
              }}
            >
              E
            </p>
          </div>
          <div
            className="direction-label"
            style={{ transform: "rotate(180deg) translateY(-118px)" }}
          >
            <p
              style={{
                transform: size
                  ? "translateX(2px) translateY(7px)"
                  : "translateX(3px)",
                fontSize: size ? "18px" : "24px",
                fontWeight: "500",
                color: theme === "light" ? "#47515C" : "#FFFFFF",
              }}
            >
              S
            </p>
          </div>
          <div
            className="direction-label"
            style={{
              transform: size
                ? "rotate(270deg) translateY(-129px) translateX(-5px)"
                : "rotate(270deg) translateY(-138px) translateX(-2px)",
              fontSize: size ? "18px" : "24px",
              fontWeight: "500",
              color: theme === "light" ? "#47515C" : "#FFFFFF",
            }}
          >
            <p style={{ transform: "rotate(90deg)" }}>W</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCompass;
