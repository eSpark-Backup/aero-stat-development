import { useContext, useEffect, useState } from "react";
import MainCard from "../../common/MainCard";
import OptionBox from "../../common/OptionBox";
import { WebSocketContext } from "../../App";
import { ThemeContext } from "../../ThemeHandler";
import close from "../../assets/close.svg";
import close2 from "../../assets/close-dark.svg";
import play from "../../assets/play.svg";
import forward from "../../assets/forward.svg";
import stop from "../../assets/stop.svg";

const RightSidebar = ({
  isOpen, // New prop to control sidebar state
  fetchingStart,
  onClose,
  HandleBrowse,
  fileName,
  HandlePlay,
  HandleForward,
  HandleStop,
  playBtn,
  fwdBtn,
  StopBtn,
}) => {
  const [fan1, setFan1] = useState("Continuous");
  const [fan2, setFan2] = useState("Off");
  const [light, setLight] = useState("Off");
  const [primary_blower, setPrimaryBlower] = useState("Off");
  const [secondary_blower, setSecondaryBlower] = useState("Off");
  const [strobe_light, setStrobeLight] = useState("Off");
  const [payload_power, setPayloadPower] = useState("Off");
  const [sendData, setSendData] = useState(false);
  const { sendJsonMessage, lastMessage } = useContext(WebSocketContext);
  const { theme, phase } = useContext(ThemeContext);

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

  const [pressedButtons, setPressedButtons] = useState({});

  const toggleButton = (key) => {
    const newState = pressedButtons[key] ? "Off" : "On";
    setPressedButtons((prev) => ({ ...prev, [key]: !prev[key] }));
    handleChange(key, newState);
  };
  return (
    // <div
    //   className={`right-sidebar ${isOpen ? "open" : "closed"} ${
    //     theme === "light" ? "light" : "dark"
    //   }`}
    // >
    //   <img
    //     onClick={onClose}
    //     className={`sidebar-close ${theme}`}
    //     src={theme === "light" ? close : close2}
    //     alt=""
    //   />
    //   <MainCard title={"Controls & Radio Link"}>
    //     <div className="control-box-card">
    //       {phase === 1 ? (
    //         <div
    //           className={`controls-box ${
    //             theme === "light" ? "controls-box-light" : "controls-box-dark"
    //           }`}
    //         >
    //           <h2>Fan Control</h2>
    //           <div
    //             className={`fan-box ${
    //               theme === "light" ? "fan-box-light" : "fan-box-dark"
    //             }`}
    //           >
    //             <p>
    //               Fan 1 <span>(Left direction)</span>
    //             </p>
    //             <OptionBox
    //               fetchingStart={fetchingStart}
    //               handleChange={handleChange}
    //               name="fan1"
    //               option1={"Continuous"}
    //               option2={"Pressured"}
    //               selectedOption={fan1}
    //               phase={1}
    //             />
    //           </div>
    //           <div
    //             className={`fan-box ${
    //               theme === "light" ? "fan-box-light" : "fan-box-dark"
    //             }`}
    //           >
    //             <p>
    //               Fan 2 <span>(Right direction)</span>
    //             </p>
    //             <OptionBox
    //               fetchingStart={fetchingStart}
    //               handleChange={handleChange}
    //               name="fan2"
    //               option1={"Continuous"}
    //               option2={"Off"}
    //               selectedOption={fan2}
    //               phase={1}
    //             />
    //           </div>
    //           <div
    //             className={`strobe fan-box ${
    //               theme === "light" ? "fan-box-light" : "fan-box-dark"
    //             }`}
    //           >
    //             <p>Strobe Lights Control</p>
    //             <OptionBox
    //               fetchingStart={fetchingStart}
    //               handleChange={handleChange}
    //               name="light"
    //               option1={"On"}
    //               option2={"Off"}
    //               selectedOption={light}
    //               phase={1}
    //             />
    //           </div>
    //         </div>
    //       ) : (
    //         <div
    //           className={`controls-box ${
    //             theme === "light" ? "controls-box-light" : "controls-box-dark"
    //           }`}
    //         >
    //           <h2>Relay Controls</h2>
    //           <div
    //             className={`fan-box ${
    //               theme === "light" ? "fan-box-light" : "fan-box-dark"
    //             }`}
    //           >
    //             <p>Primary Blower</p>
    //             <OptionBox
    //               fetchingStart={fetchingStart}
    //               handleChange={handleChange}
    //               name={"primary_blower"}
    //               option1={"On"}
    //               option2={"Off"}
    //               selectedOption={primary_blower}
    //               phase={2}
    //             />
    //           </div>
    //           <div
    //             className={`fan-box ${
    //               theme === "light" ? "fan-box-light" : "fan-box-dark"
    //             }`}
    //           >
    //             <p>Secondary Blower</p>
    //             <OptionBox
    //               fetchingStart={fetchingStart}
    //               handleChange={handleChange}
    //               name={"secondary_blower"}
    //               option1={"On"}
    //               option2={"Off"}
    //               selectedOption={secondary_blower}
    //               phase={2}
    //             />
    //           </div>
    //           <div
    //             className={`fan-box ${
    //               theme === "light" ? "fan-box-light" : "fan-box-dark"
    //             }`}
    //           >
    //             <p>Strobe Lights</p>
    //             <OptionBox
    //               fetchingStart={fetchingStart}
    //               handleChange={handleChange}
    //               name={"strobe_light"}
    //               option1={"On"}
    //               option2={"Off"}
    //               selectedOption={strobe_light}
    //               phase={2}
    //             />
    //           </div>
    //           <div
    //             className={`fan-box ${
    //               theme === "light" ? "fan-box-light" : "fan-box-dark"
    //             }`}
    //           >
    //             <p>Payload Power</p>
    //             <OptionBox
    //               fetchingStart={fetchingStart}
    //               handleChange={handleChange}
    //               name={"payload_power"}
    //               option1={"On"}
    //               option2={"Off"}
    //               selectedOption={payload_power}
    //               phase={2}
    //             />
    //           </div>
    //         </div>
    //       )}
    //     </div>
    //     <h2
    //       className={`data-logging-title ${
    //         theme === "light" ? "light" : "dark"
    //       }`}
    //     >
    //       Data Logging
    //     </h2>

    //     <div className="log-box-content">
    //       <div
    //         className={`log-input-box ${
    //           theme === "light" ? "log-input-box-light" : "log-input-box-dark"
    //         }`}
    //       >
    //         <p>Log File</p>
    //         <div
    //           className={`file-name-box ${
    //             theme === "light" ? "file-name-box-light" : "file-name-box-dark"
    //           }`}
    //         >
    //           {fileName ? fileName : ""}
    //         </div>
    //         <input
    //           type="file"
    //           id="fileInput"
    //           style={{ display: "none" }}
    //           onChange={HandleBrowse}
    //           disabled={phase === 2 || (!playBtn && StopBtn) ? true : false}
    //         />
    //         <label
    //           htmlFor="fileInput"
    //           className={`custom-file-input ${theme} ${
    //             phase === 2 || (!playBtn && StopBtn) ? "disable" : ""
    //           }`}
    //         >
    //           Browse
    //         </label>
    //       </div>
    //       <div className="button-groups">
    //         <div
    //           className={`tdbutton ${
    //             theme === "light" ? "td-light" : "td-dark"
    //           }`}
    //         >
    //           <button
    //             className={`upper-part ${
    //               phase === 2 || !playBtn ? "disable" : ""
    //             }`}
    //             disabled={phase === 2 || !playBtn}
    //             onClick={HandlePlay}
    //           >
    //             <img src={play} alt="" />
    //           </button>
    //         </div>
    //         <div
    //           className={`tdbutton ${
    //             theme === "light" ? "td-light" : "td-dark"
    //           }`}
    //         >
    //           <button
    //             className={`upper-part ${
    //               phase === 2 || !fwdBtn ? "disable" : ""
    //             }`}
    //             disabled={phase === 2 || !fwdBtn}
    //             onClick={HandleForward}
    //           >
    //             <img src={forward} alt="" />
    //           </button>
    //         </div>
    //         <div
    //           className={`tdbutton ${
    //             theme === "light" ? "td-light" : "td-dark"
    //           }`}
    //         >
    //           <button
    //             className={`upper-part ${
    //               phase === 2 || !StopBtn ? "disable" : ""
    //             }`}
    //             disabled={phase === 2 || !StopBtn}
    //             onClick={HandleStop}
    //           >
    //             <img src={stop} alt="" />
    //           </button>
    //         </div>
    //       </div>
    //     </div>
    //   </MainCard>
    // </div>
    // <div className={`right-sidebar ${isOpen ? "open" : "closed"}`}>
    //   <div className="right-sidebar-content">
    //     {/* Close Button */}

    //     <div className="right-section-design">
    //       <button className="close-btn" onClick={onClose}>
    //         <img src={theme === "light" ? close : close2} alt="Close" />
    //       </button>
    //       <div className="controls-box">
    //         {[
    //           {
    //             key: "primary_blower",
    //             imgLight: "/src/assets/primary_blower.png",
    //             imgDark: "/src/assets/primary_blower-dark.png",
    //           },
    //           {
    //             key: "secondary_blower",
    //             imgLight: "/src/assets/secondary_blower.png",
    //             imgDark: "/src/assets/secondary_blower-dark.png",
    //           },
    //           {
    //             key: "strobe_light",
    //             imgLight: "/src/assets/strobe_lights.png",
    //             imgDark: "/src/assets/strobe_light-dark.png",
    //           },
    //           {
    //             key: "payload_power",
    //             imgLight: "/src/assets/payload_power.png",
    //             imgDark: "/src/assets/payload_power-dark.png",
    //           },
    //         ].map(({ key, imgLight, imgDark }) => (
    //           <div key={key} className="fan-box">
    //             <div
    //               className={`button-container ${
    //                 pressedButtons[key] ? "pressed" : ""
    //               }`}
    //               onClick={() => toggleButton(key)}
    //             >
    //               <img
    //                 src={theme === "light" ? imgLight : imgDark}
    //                 alt={key}
    //                 className="button-img"
    //               />
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <></>
  );
};

export default RightSidebar;
