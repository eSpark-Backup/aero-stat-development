import React, { useContext, useEffect, useState } from "react";
import logowhite from "../../assets/Alfa dark.png";
// import logo from "../../assets/black_logo.png"
import logo from "../../assets/Alfa light.png";
import { ThemeContext } from "../../ThemeHandler";
import { formatDateTime } from "../../Js_parsing";
import menuLight from "../../assets/menu-light.svg";
import menuDark from "../../assets/menu-dark.svg";

const Header = ({
  time,
  fileFetching,
  handleSidebarOpen,
  handleRightSidebarOpen,
}) => {
  const { theme } = useContext(ThemeContext);

  const [currTime, setTime] = useState(time ? time : formatDateTime());

  const date = new Date(currTime);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const day = date.toLocaleDateString("en-US", options);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  const FetchTime = () => {
    setTime(formatDateTime());
  };

  useEffect(() => {
    if (time) {
      setTime(time);
    }
  }, [time]);

  useEffect(() => {
    if (!fileFetching) {
      const interval = setInterval(FetchTime, 1000);
      return () => clearInterval(interval);
    }
  }, [fileFetching]);

  // useEffect(() => {
  //     console.log(currTime);
  // }, [currTime]);

  return (
    <>
      <div className="header">
        <div
          className={`logo ${theme === "light" ? "logo-light" : "logo-dark"}`}
        >
          <img
            style={{ height: "80px" }}
            src={theme === "light" ? logo : logowhite}
            alt="Logo"
          />
        </div>
        <div
          className={`header-details ${
            theme === "light" ? "header-details-light" : "header-details-dark"
          }`}
        >
          <div>
            <div className="menu-parent">
              <div onClick={handleSidebarOpen} className={`${theme} menu-icon`}>
                <img
                  src={theme === "light" ? menuLight : menuDark}
                  alt="menu-icon"
                />
              </div>
              {/* <h2
                className={`data-type ${
                  theme === "light" ? "data-type-light" : "data-type-dark"
                }`}
              >
                {fileFetching ? "Recorded Data:" : "Live Data:"}
              </h2> */}
            </div>
            <div
              className={`day ${theme === "light" ? "day-light" : "day-dark"}`}
            >
              <h2>{day}</h2>
            </div>
          </div>
          <div>
            <div className="time-box">
              <div
                className={`time ${
                  theme === "light" ? "time-light" : "time-dark"
                }`}
              >
                <h3>{hours[0]}</h3>
              </div>
              <div
                className={`time ${
                  theme === "light" ? "time-light" : "time-dark"
                }`}
              >
                <h3>{hours[1]}</h3>
              </div>
            </div>
            <div className="colon-box">
              <div
                className={`colon ${
                  theme === "light" ? "colon-light" : "colon-dark"
                }`}
              ></div>
              <div
                className={`colon ${
                  theme === "light" ? "colon-light" : "colon-dark"
                }`}
              ></div>
            </div>
            <div className="time-box">
              <div
                className={`time ${
                  theme === "light" ? "time-light" : "time-dark"
                }`}
              >
                <h3>{minutes[0]}</h3>
              </div>
              <div
                className={`time ${
                  theme === "light" ? "time-light" : "time-dark"
                }`}
              >
                <h3>{minutes[1]}</h3>
              </div>
            </div>
            <div className="colon-box">
              <div
                className={`colon ${
                  theme === "light" ? "colon-light" : "colon-dark"
                }`}
              ></div>
              <div
                className={`colon ${
                  theme === "light" ? "colon-light" : "colon-dark"
                }`}
              ></div>
            </div>
            <div className="time-box">
              <div
                className={`time ${
                  theme === "light" ? "time-light" : "time-dark"
                }`}
              >
                <h3>{seconds[0]}</h3>
              </div>
              <div
                className={`time ${
                  theme === "light" ? "time-light" : "time-dark"
                }`}
              >
                <h3>{seconds[1]}</h3>
              </div>
              <div
                onClick={handleRightSidebarOpen}
                className={`${theme} menu-icon right-menu`}
              >
                <img
                  src={theme === "light" ? menuLight : menuDark}
                  alt="menu-icon"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
