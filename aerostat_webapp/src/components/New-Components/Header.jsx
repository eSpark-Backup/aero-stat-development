import React, { useContext, useEffect, useState } from "react";
import logowhite from "../../assets/Alfa dark.png";
// import logo from "../../assets/black_logo.png"
import logo from "../../assets/Alfa light.png";
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
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [currTime, setTime] = useState(time ? time : formatDateTime());
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const isEnglish = i18n.language === "en";

  const toggleLanguage = () => {
    i18n.changeLanguage(isEnglish ? "ar" : "en");
  };

  return (
    <div className="header">
      <div className={`logo ${theme === "light" ? "logo-light" : "logo-dark"}`}>
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
              {fileFetching ? "Recorded Data:" : t("liveData")}
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
          <div className="time-box" style={{ marginTop: "2px" }}>
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
          </div>
          {/* Gear Icon and Dropdown */}
          <div
            className="gear-icon menu-icon"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              cursor: "pointer",
              marginLeft: "10px",
              fontSize: "20px",
              background: theme === "light" ? "#fff" : "#333",
              boxShadow:
                theme === "light"
                  ? "0 2px 10px rgba(0,0,0,0.2)"
                  : "0 2px 10px rgba(255,255,255,0.1)",
            }}
          >
            ⚙️
          </div>
          {dropdownOpen && (
            <div
              className="dropdown-menu"
              style={{
                position: "absolute",
                background: theme === "light" ? "#fff" : "#333",
                color: theme === "light" ? "#333" : "#fff",
                boxShadow:
                  theme === "light"
                    ? "0 2px 10px rgba(0,0,0,0.2)"
                    : "0 2px 10px rgba(255,255,255,0.1)",
                padding: "10px",
                borderRadius: "5px",
                top: "87px",
                [i18n.language === "ar" ? "left" : "right"]: "99px", // Change dynamically
                zIndex: 90,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: theme === "light" ? "#e3e6ec" : "#444",
                  border: "none",
                  borderRadius: "30px",
                  padding: "6px",
                  fontSize: "12px",
                  fontWeight: "500",
                  color: theme === "light" ? "#333" : "#fff",
                  cursor: "pointer",
                  transition: "0.3s ease-in-out",
                  boxShadow:
                    theme === "light"
                      ? "inset 4px 4px 8px #b8b9be, inset -4px -4px 8px #ffffff"
                      : "inset 4px 4px 8px #222, inset -4px -4px 8px #555",
                  width: "100px",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "25px",
                    background: isEnglish
                      ? "#007BFF"
                      : theme === "light"
                      ? "#e3e6ec"
                      : "#555",
                    color: isEnglish
                      ? "#fff"
                      : theme === "light"
                      ? "#666"
                      : "#ccc",
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
                    background: !isEnglish
                      ? "#007BFF"
                      : theme === "light"
                      ? "#e3e6ec"
                      : "#555",
                    color: !isEnglish
                      ? "#fff"
                      : theme === "light"
                      ? "#666"
                      : "#ccc",
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

              {/* Theme Toggle */}
              <div
                className="theme-toggle"
                onClick={toggleTheme}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 12px",
                  borderRadius: "30px",
                  background: theme === "light" ? "#f5f5f5" : "#222",
                  transition: "0.3s ease",
                  fontWeight: "bold",
                  textAlign: "center",
                  color: theme === "light" ? "#333" : "#fff",
                }}
              >
                {theme === "light" ? (
                  <>
                    <div className="theme-light"></div>
                    <p className="theme-text-light">Light</p>
                  </>
                ) : (
                  <>
                    <p className="theme-text-dark">Dark</p>
                    <div className="theme-dark"></div>
                  </>
                )}
              </div>
            </div>
          )}

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
  );
};

export default Header;
