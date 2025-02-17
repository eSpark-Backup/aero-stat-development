import React, { useContext, useEffect, useState } from "react";
import logo from "../../assets/logo.svg";
// import logo from "../../assets/black_logo.png"
import logowhite from "../../assets/logo-white.svg";
import { ThemeContext } from "../../ThemeHandler";
import { formatDateTime } from "../../Js_parsing";
import menuLight from "../../assets/menu-light.svg";
import menuDark from "../../assets/menu-dark.svg";
import i18n from "../../i18n";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

const Header = ({
  time,
  fileFetching,
  handleSidebarOpen,
  handleRightSidebarOpen,
}) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
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

  const { i18n } = useTranslation();
  const isEnglish = i18n.language === "en";

  const toggleLanguage = () => {
    i18n.changeLanguage(isEnglish ? "ar" : "en");
  };

  return (
    <>
      <div className="header">
        <div
          className={`logo ${theme === "light" ? "logo-light" : "logo-dark"}`}
        >
          <img src={theme === "light" ? logo : logowhite} alt="Logo" />
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
              <h2
                className={`data-type ${
                  theme === "light" ? "data-type-light" : "data-type-dark"
                }`}
              >
                {fileFetching ? "Recorded Data:" : t("liveData")}
              </h2>
            </div>
            <div
              className={`day ${theme === "light" ? "day-light" : "day-dark"}`}
            >
              <h2>{day}</h2>
            </div>
            <button
              onClick={toggleLanguage}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#e3e6ec",
                border: "none",
                borderRadius: "30px",
                padding: "6px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#333",
                cursor: "pointer",
                transition: "0.3s ease-in-out",
                boxShadow:
                  "inset 4px 4px 8px #b8b9be, inset -4px -4px 8px #ffffff",
                width: "120px",
                position: "relative",
              }}
            >
              <span
                style={{
                  padding: "6px 12px",
                  borderRadius: "25px",
                  background: isEnglish ? "#007BFF" : "#e3e6ec",
                  color: isEnglish ? "#fff" : "#666",
                  transition: "0.3s ease",
                  fontWeight: "bold",
                  boxShadow: isEnglish
                    ? "3px 3px 6px #b8b9be, -3px -3px 6px #ffffff"
                    : "none",
                }}
              >
                EN
              </span>
              <span
                style={{
                  padding: "6px 12px",
                  borderRadius: "25px",
                  background: !isEnglish ? "#007BFF" : "#e3e6ec",
                  color: !isEnglish ? "#fff" : "#666",
                  transition: "0.3s ease",
                  fontWeight: "bold",
                  boxShadow: !isEnglish
                    ? "3px 3px 6px #b8b9be, -3px -3px 6px #ffffff"
                    : "none",
                }}
              >
                AR
              </span>
            </button>
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
              {/* <div
                onClick={handleRightSidebarOpen}
                className={`${theme} menu-icon right-menu`}
              >
                <img
                  src={theme === "light" ? menuLight : menuDark}
                  alt="menu-icon"
                />
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
