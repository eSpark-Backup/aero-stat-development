import { useContext } from "react";
import { ThemeContext } from "../../ThemeHandler";
import logo from "../../assets/logo.svg";
import logowhite from "../../assets/logo-white.svg";
import close from "../../assets/close.svg";
import close2 from "../../assets/close-dark.svg";
import { updateToggle } from "../../utils";
import { WebSocketContext } from "../../App";

const Sidebar = ({
  open,
  onClose,
  handleOpenModal,
  playBtn,
  StopBtn,
  fwdBtn,
}) => {
  const { theme } = useContext(ThemeContext);
  const { phase, setPhase,setPhase1Start } = useContext(ThemeContext);
  const { sendJsonMessage } = useContext(WebSocketContext);

  const changePhase = async (newPhase) => {
    if (phase === newPhase) {
      return
    }
    console.log(newPhase)
    if (newPhase === 2) {
      sendJsonMessage({
        "method": "alfa.phase.settings.set",
        "phaseType": "modbus"
      })
      setPhase1Start(false)
    }
    else {
      sendJsonMessage({
        "method": "alfa.phase.settings.set",
        "phaseType": "tcp"
      })
    }
    setPhase(newPhase);
  };

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
        <div style={{ display: "flex", flexDirection: "column", rowGap: "20px" }}>
          <p className={phase === 2 && "side-item-notactive"} onClick={() => changePhase(1)}>Phase 1</p>
          <p className={phase === 1 && "side-item-notactive"} onClick={() => changePhase(2)}>Phase 2</p>
        </div>
        <div
          style={{ width: "306px" }}
          className={`config-box ${theme === "light" ? "config-box-light" : "config-box-dark"
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
    </div>
  );
};

export default Sidebar;
