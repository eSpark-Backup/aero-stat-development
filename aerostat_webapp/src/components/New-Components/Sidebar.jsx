import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../ThemeHandler";
import logo from "../../assets/logo.svg";
import logowhite from "../../assets/logo-white.svg";
import close from "../../assets/close.svg";
import close2 from "../../assets/close-dark.svg";
import { updateToggle } from "../../utils";
import { WebSocketContext } from "../../App";
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

  const changePhase = async (newPhase) => {
    if (phase === newPhase) {
      return;
    }

    if (newPhase === 2 && fileFetchingStart) {
      return;
    }
    if (newPhase === 2) {
      sendJsonMessage({
        method: "alfa.phase.settings.set",
        phaseType: "modbus",
      });
      if (!isPhase2Starts) {
        setPhase1Start(false);
      }
      if (isPhase2Starts) {
        setPhase1Start(true);
      }
      setPhase2Start(true);
    } else {
      sendJsonMessage({
        method: "alfa.phase.settings.set",
        phaseType: "tcp",
      });
      if (isPhase1Starts) {
        setPhase1Start(true);
      } else {
        setPhase1Start(false);
      }
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
        alt=""
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
              cursor: fileFetchingStart && "not-allowed",
              backgroundColor: fileFetchingStart && "#cbcbcbbb",
            }}
            className={phase === 1 && "side-item-notactive"}
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
              <h4>{t("logFile")}</h4>
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
      </div>
      <div style={{ color: "grey", position: "absolute", bottom: "0" }}>
        v2.1.6
      </div>
    </div>
  );
};

export default Sidebar;
