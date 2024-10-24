import { useContext } from "react";
import { ThemeContext } from "../../ThemeHandler";
import logo from "../../assets/logo.svg";
import logowhite from "../../assets/logo-white.svg";
import close from "../../assets/close.svg";
import close2 from "../../assets/close-dark.svg";

const Sidebar = ({
  open,
  onClose,
  handleOpenModal,
  playBtn,
  StopBtn,
  fwdBtn,
}) => {
  const { theme } = useContext(ThemeContext);

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
        <p>Dashboard</p>
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
      </div>
    </div>
  );
};

export default Sidebar;
