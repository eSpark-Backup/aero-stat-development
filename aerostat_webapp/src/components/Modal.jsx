import { useEffect } from "react";
import close from "../assets/close.svg"
import close2 from "../assets/close-dark.svg"


const validateIpAddress = (ip) => {
  const ipRegex = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;
  return ipRegex.test(ip.trim());
};

const Modal = ({ open, handleClose, handleSubmit, form, setForm, theme, errorValues, setErrorValues }) => {
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (open && e.target.classList.contains("modal-bg")) {
        handleClose();
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [open, handleClose]);

  const handleChange = (val, field) => {
    setForm((prev) => {
      const newForm = { ...prev, [field]: val };
      if (field === 'ip') {
        setErrorValues((prevErrors) => {
          if (validateIpAddress(val)) {
            return prevErrors.filter((err) => err !== 'ip');
          } else {
            return [...prevErrors, 'ip'];
          }
        });
      } else {
        setErrorValues((prevErrors) => {
          if (val.trim() === "" && !prevErrors.includes(field)) {
            return [...prevErrors, field];
          } else if (val.trim() !== "" && prevErrors.includes(field)) {
            return prevErrors.filter((err) => err !== field);
          }
          return prevErrors;
        });
      }

      return newForm;
    });
  };

  return (
    <div className={`modal-bg ${open ? "active" : ""}`}>
      <div className={`modal ${theme}`}>
        <div className={`modal-header ${theme}`}>
          <div>
            <p>Configuration</p>
            <button onClick={handleClose}>
              <img src={theme === "light" ? close : close2} alt="" />
            </button>
          </div>
        </div>
        <div className="modal-body">
          <div className={`modal-input ${theme}`}>
            <p className={`${theme}`}>GCS Address</p>
            <input
              placeholder="192.168.0.102"
              type="text"
              value={form.ip}
              className={errorValues.includes("ip") ? "input-err" : ""}
              onChange={(e) => handleChange(e.target.value, "ip")}
            />
          </div>
          <div className={`modal-input ${theme}`}>
            <p className={`${theme}`}>Weather Station Port</p>
            <input
              placeholder="4002"
              type="number"
              value={form.weather}
              className={errorValues.includes("weather") && form.weather === "" ? "input-err" : ""}
              onChange={(e) => handleChange(e.target.value, "weather")}
            />
          </div>
          <div className={`modal-input ${theme}`}>
            <p className={`${theme}`}>HMR Port</p>
            <input
              placeholder="4003"
              type="number"
              value={form.hmr}
              className={errorValues.includes("hmr") && form.hmr === "" ? "input-err" : ""}
              onChange={(e) => handleChange(e.target.value, "hmr")}
            />
          </div>
          <div className={`modal-input ${theme}`}>
            <p className={`${theme}`}>Ballonet Pressure Port</p>
            <input
              type="number"
              placeholder="4004"
              value={form.ballonet}
              className={errorValues.includes("ballonet") && form.ballonet === "" ? "input-err" : ""}
              onChange={(e) => handleChange(e.target.value, "ballonet")}
            />
          </div>
          <div className={`modal-input ${theme}`}>
            <p className={`${theme}`}>Helium Pressure Port</p>
            <input
              type="number"
              placeholder="4005"
              value={form.helium}
              className={errorValues.includes("helium") && form.helium === "" ? "input-err" : ""}
              onChange={(e) => handleChange(e.target.value, "helium")}
            />
          </div>
          <div className={`modal-input ${theme}`}>
            <p className={`${theme}`}>ADAM Port</p>
            <input
              type="number"
              placeholder="4006"
              value={form.adam}
              className={errorValues.includes("adam") && form.adam === "" ? "input-err" : ""}
              onChange={(e) => handleChange(e.target.value, "adam")}
            />
          </div>
          <div className={`modal-input ${theme}`}>
            <p className={`${theme}`}>EBox Port</p>
            <input
              type="number"
              placeholder="4007"
              value={form.ebox}
              className={errorValues.includes("ebox") && form.ebox === "" ? "input-err" : ""}
              onChange={(e) => handleChange(e.target.value, "ebox")}
            />
          </div>
          <div className={`modal-btn-group ${theme}`}>
            {/* <button className="outlined" onClick={handleClose}>
              Close
            </button>
            <button className="contained" onClick={handleSubmit}>
              Save
            </button> */}
            <button onClick={handleSubmit}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
