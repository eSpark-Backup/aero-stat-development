import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../ThemeHandler";
import logo from "../../assets/logo.svg";
import logowhite from "../../assets/logo-white.svg";
import close from "../../assets/close.svg";
import close2 from "../../assets/close-dark.svg";
import { WebSocketContext } from "../../App";
import LineChartWithDropdown from "./LineChart";

const Sidebar = ({
  open,
  onClose,
  handleOpenModal,
  playBtn,
  StopBtn,
  fwdBtn,
  response,
}) => {
  const { theme } = useContext(ThemeContext);
  const {
    phase,
    setPhase,
    setPhase1Start,
    setPhase2Start,
    isPhase1Starts,
    setIsPhase2Starts,
    isPhase2Starts,
    fileFetchingStart,
  } = useContext(ThemeContext);
  const { sendJsonMessage } = useContext(WebSocketContext);
  const [dataPoints, setDataPoints] = useState({
    "Hull Pressure": [],
    "Barometric Pressure": [],
    "Outside Temperature": [],
    "Ballonet Pressure": [],
    "Ballonet Curtain": [],
  });

  useEffect(() => {
    if (response) {
      setDataPoints((prevData) => {
        const newData = {
          "Hull Pressure": updateData(
            prevData["Hull Pressure"],
            response?.helium?.hel_pressure
          ),
          "Barometric Pressure": updateData(
            prevData["Barometric Pressure"],
            response?.weather?.baro_presssure
          ),
          "Outside Temperature": updateData(
            prevData["Outside Temperature"],
            response?.weather?.air_temp
          ),
          "Ballonet Pressure": updateData(
            prevData["Ballonet Pressure"],
            response?.ballonet?.bal_pressure
          ),
          "Ballonet Curtain": updateData(
            prevData["Ballonet Curtain"],
            response?.ballonet?.ballonet_height
          ),
        };
        console.log("Updated DataPoints:", newData); // ✅ Debug data
        return newData;
      });
    }
  }, [response]);

  const updateData = (prevArray, newValue) => {
    if (newValue === undefined || isNaN(parseFloat(newValue))) return prevArray; // Ignore invalid data
    const newArray = [...prevArray, parseFloat(newValue)];
    if (newArray.length > 10) newArray.shift(); // Keep only last 10 points
    return newArray;
  };
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const changePhase = async (newPhase) => {
    if (phase === newPhase || (newPhase === 2 && fileFetchingStart)) return;

    sendJsonMessage({
      method: "alfa.phase.settings.set",
      phaseType: newPhase === 2 ? "modbus" : "tcp",
    });

    if (newPhase === 2) {
      if (!isPhase2Starts) setPhase1Start(false);
      if (isPhase2Starts) setPhase1Start(true);
      setPhase2Start(true);
    } else {
      setPhase1Start(isPhase1Starts);
    }

    setPhase(newPhase);
  };

  return (
    <div className={`sidebar ${open ? "open" : ""} ${theme}`}>
      <img
        onClick={onClose}
        className={`sidebar-close ${theme}`}
        src={theme === "light" ? close : close2}
        alt="Close"
      />
      <img src={theme === "light" ? logo : logowhite} alt="Logo" />

      <div className="sidebar-menu">
        <div
          style={{ display: "flex", flexDirection: "column", rowGap: "20px" }}
        >
          <p
            className={phase === 2 ? "side-item-notactive" : ""}
            onClick={() => changePhase(1)}
          >
            Phase 1
          </p>
          <p
            style={{
              cursor: fileFetchingStart ? "not-allowed" : "pointer",
              backgroundColor: fileFetchingStart ? "#cbcbcbbb" : "transparent",
            }}
            className={phase === 1 ? "side-item-notactive" : ""}
            onClick={() => changePhase(2)}
          >
            Phase 2
          </p>
        </div>

        <div
          style={{ width: "306px" }}
          className={`config-box ${
            theme === "light" ? "config-box-light" : "config-box-dark"
          }`}
        >
          <button
            onClick={() => {
              onClose();
              handleOpenModal();
            }}
            className={
              (!playBtn && StopBtn && fwdBtn) ||
              (!playBtn && !fwdBtn && StopBtn)
                ? "disable"
                : ""
            }
          >
            Config
          </button>
        </div>

        {/* Button to Open Popup */}
        <button onClick={() => setIsPopupOpen(true)} className="popup-btn">
          Analysis
        </button>
      </div>

      <div style={{ color: "grey", position: "absolute", bottom: "0" }}>
        v2.1.7
      </div>

      {/* Popup Modal */}
      {isPopupOpen && (
        <div className="popup-overlay">
          <button className="close-btn" onClick={() => setIsPopupOpen(false)}>
            ✖
          </button>
          <LineChartWithDropdown
            theme={theme}
            phase={phase}
            isPhase1Starts={isPhase1Starts}
            isPhase2Starts={isPhase2Starts}
            data={dataPoints}
          />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
