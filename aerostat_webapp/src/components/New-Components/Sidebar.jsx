import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../ThemeHandler";
import logo from "../../assets/logo.svg";
import logowhite from "../../assets/logo-white.svg";
import close from "../../assets/close.svg";
import close2 from "../../assets/close-dark.svg";
import { WebSocketContext } from "../../App";
import LineChartWithDropdown from "./LineChart";
import play from "../../assets/play.svg";
import forward from "../../assets/forward.svg";
import stop from "../../assets/stop.svg";
import { useTranslation } from "react-i18next";

const Sidebar = ({
  open,
  onClose,
  handleOpenModal,
  playBtn,
  StopBtn,
  fwdBtn,
  response,
  isOpen, // New prop to control sidebar state
  fetchingStart,
  HandleBrowse,
  fileName,
  HandlePlay,
  HandleForward,
  HandleStop,
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
  const { sendJsonMessage, lastMessage } = useContext(WebSocketContext);
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

  const [fan1, setFan1] = useState("Continuous");
  const [fan2, setFan2] = useState("Off");
  const [light, setLight] = useState("Off");
  const [primary_blower, setPrimaryBlower] = useState("Off");
  const [secondary_blower, setSecondaryBlower] = useState("Off");
  const [strobe_light, setStrobeLight] = useState("Off");
  const [payload_power, setPayloadPower] = useState("Off");
  const [sendData, setSendData] = useState(false);
  const { t } = useTranslation();

  const handleChange = (name, value) => {
    console.log("Fetching Start:", fetchingStart);
    if (fetchingStart) {
      console.log(`Changing ${name} to ${value}`);
      switch (name) {
        case "fan1":
          setFan1(value);
          break;
        case "fan2":
          setFan2(value);
          break;
        case "light":
          setLight(value);
          break;
        case "primary_blower":
          setPrimaryBlower(value);
          break;
        case "secondary_blower":
          setSecondaryBlower(value);
          break;
        case "strobe_light":
          setStrobeLight(value);
          break;
        case "payload_power":
          setPayloadPower(value);
          break;
        default:
          break;
      }
      setSendData(true);
      console.log("sendData set to true");
    } else {
      console.log("fetchingStart is FALSE, ignoring change.");
    }
  };
  useEffect(() => {
    let relayControls = {};
    if (phase === 1) {
      relayControls = {
        method: "alfa.actuator.settings.set",
        tcp: [
          {
            name: "tcp1",
            fan: [fan1 === "Pressured" ? 0 : 1, fan2 === "Off" ? 0 : 1],
            strobe_light: [light === "On" ? 1 : 0],
          },
        ],
      };
    }
    if (phase === 2) {
      relayControls = {
        method: "alfa.actuator.settings.set",
        modbus: [
          {
            name: "modbus-relay",
            relay: [
              primary_blower === "On" ? 1 : 0,
              secondary_blower === "On" ? 1 : 0,
              strobe_light === "On" ? 1 : 0,
              payload_power === "On" ? 1 : 0,
            ],
          },
        ],
      };
    }
    if (sendData) {
      console.log("Sending data to WebSocket:", relayControls);
      sendJsonMessage(relayControls);
      console.log("Controls successfully posted:", relayControls);
      setSendData(false);
    }
  }, [
    sendData,
    fan1,
    fan2,
    light,
    primary_blower,
    secondary_blower,
    strobe_light,
    payload_power,
  ]);

  useEffect(() => {
    if (lastMessage?.data) {
      const data = JSON.parse(lastMessage.data);
      const status = data.status;
      if (status === "success") {
        if (phase === 1) {
          setFan1(
            data?.settings_set?.tcp?.fan?.fan_one === "OFF"
              ? "Pressured"
              : "Continuous"
          );
          setFan2(
            data?.settings_set?.tcp?.fan?.fan_two === "OFF"
              ? "Off"
              : "Continuous"
          );
          setLight(
            data?.settings_set?.tcp?.strobe_light === "OFF" ? "Off" : "On"
          );
          console.log(
            `${data?.settings_set?.tcp?.fan?.fan_one} ${data?.settings_set?.tcp?.fan?.fan_two} ${data?.settings_set?.tcp?.strobe_light}`
          );
        }
        if (phase === 2) {
          setPrimaryBlower(
            data?.settings_set?.modbus?.relay[0] === 1 ? "On" : "Off"
          );
          setSecondaryBlower(
            data?.settings_set?.modbus?.relay[1] === 1 ? "On" : "Off"
          );
          setStrobeLight(
            data?.settings_set?.modbus?.relay[2] === 1 ? "On" : "Off"
          );
          setPayloadPower(
            data?.settings_set?.modbus?.relay[3] === 1 ? "On" : "Off"
          );
          console.log(data?.settings_set?.modbus?.relay);
        }
      }
    }
  }, [lastMessage]);

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
          {/* <p
            className={phase === 2 && "side-item-notactive"}
            onClick={() => changePhase(1)}
          >
            Phase 1
          </p> */}
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

        <div>
          <h2
            className={`data-logging-title ${
              theme === "light" ? "light" : "dark"
            }`}
          >
            {t("dataLogging")}
          </h2>
          <div className="log-box-content">
            <div
              className={`log-input-box ${
                theme === "light" ? "log-input-box-light" : "log-input-box-dark"
              }`}
            >
              <h4 style={{ color: theme === "light" ? "#161a25" : "#f8f8f8" }}>
                {t("logFile")}
              </h4>
              <div
                className={`file-name-box ${
                  theme === "light"
                    ? "file-name-box-light"
                    : "file-name-box-dark"
                }`}
              >
                {fileName ? fileName : ""}
              </div>
              <input
                type="file"
                id="fileInput"
                style={{ display: "none" }}
                onChange={HandleBrowse}
                disabled={phase === 2 || (!playBtn && StopBtn) ? true : false}
              />
              <label
                htmlFor="fileInput"
                className={`custom-file-input ${theme} ${
                  phase === 2 || (!playBtn && StopBtn) ? "disable" : ""
                }`}
              >
                {t("browse")}
              </label>
            </div>
            <div className="button-groups">
              <div
                className={`tdbutton ${
                  theme === "light" ? "td-light" : "td-dark"
                }`}
              >
                <button
                  className={`upper-part ${
                    phase === 2 || !playBtn ? "disable" : ""
                  }`}
                  disabled={phase === 2 || !playBtn}
                  onClick={HandlePlay}
                >
                  <img src={play} alt="" />
                </button>
              </div>
              <div
                className={`tdbutton ${
                  theme === "light" ? "td-light" : "td-dark"
                }`}
              >
                <button
                  className={`upper-part ${
                    phase === 2 || !fwdBtn ? "disable" : ""
                  }`}
                  disabled={phase === 2 || !fwdBtn}
                  onClick={HandleForward}
                >
                  <img src={forward} alt="" />
                </button>
              </div>
              <div
                className={`tdbutton ${
                  theme === "light" ? "td-light" : "td-dark"
                }`}
              >
                <button
                  className={`upper-part ${
                    phase === 2 || !StopBtn ? "disable" : ""
                  }`}
                  disabled={phase === 2 || !StopBtn}
                  onClick={HandleStop}
                >
                  <img src={stop} alt="" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{ width: "306px", marginTop: "20px" }}
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
        <div
          style={{ width: "306px" }}
          className={`config-box ${
            theme === "light" ? "config-box-light" : "config-box-dark"
          }`}
        >
          {/* Button to Open Popup */}
          <button onClick={() => setIsPopupOpen(true)} className="popup-btn">
            Analysis
          </button>
        </div>
      </div>

      <div style={{ color: "grey", position: "absolute", bottom: "0" }}>
        v2.2.1
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
