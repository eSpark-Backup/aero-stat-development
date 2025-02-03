import { useContext, useEffect } from "react";
import close from "../assets/close.svg"
import close2 from "../assets/close-dark.svg"
import { ThemeContext } from "../ThemeHandler";


const validateIpAddress = (ip) => {
  const ipRegex = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;
  return ipRegex.test(ip.trim());
};

const Modal = ({ open, handleClose, handleSubmit, theme, errorValues, setErrorValues }) => {
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

  const { form, setForm, phase } = useContext(ThemeContext);


  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "auto";
    }
    if (open) {
      document.body.style.overflow = "hidden"
    }
  }, [open])

  const handleChange = (val, field) => {
    setForm((prev) => {
      const newForm = { ...prev, [field]: val };
      if (field === 'rawtcp_host_ip' || field === 'modbustcp_host_ip') {
        setErrorValues((prevErrors) => {
          if (validateIpAddress(val)) {
            return prevErrors.filter((err) => err !== field);
          } else {
            return prevErrors.includes(field) ? prevErrors : [...prevErrors, field];
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
        {
          phase === 1 ?
            <div className="modal-body">
              <div className={`modal-input ${theme}`}>
                <p className={`${theme}`}>Rawtcp host ip</p>
                <input
                  placeholder="192.168.0.102"
                  type="text"
                  value={form.rawtcp_host_ip}
                  className={errorValues.includes("rawtcp_host_ip") ? "input-err" : ""}
                  onChange={(e) => handleChange(e.target.value, "rawtcp_host_ip")}
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
                <button onClick={handleSubmit}>Save</button>
              </div>
            </div>
            :
            <div className="modal-body">
              <div className={`modal-input ${theme}`}>
                <p className={`${theme}`}>Modbus host ip</p>
                <input
                  placeholder="192.168.0.102"
                  type="text"
                  value={form.modbustcp_host_ip}
                  onChange={(e) => handleChange(e.target.value, "modbustcp_host_ip")}
                  className={errorValues.includes("modbustcp_host_ip") ? "input-err" : ""}
                />
              </div>
              <div className={`modal-input ${theme}`}>
                <p className={`${theme}`}>Hull Pressure</p>
                <input
                  placeholder="5001"
                  type="text"
                  value={"5001"}
                  readOnly
                />
              </div>
              <div className={`modal-input ${theme}`}>
                <p className={`${theme}`}>Ballonet pressure</p>
                <input
                  placeholder="5002"
                  type="text"
                  value={"5002"}
                  readOnly
                />
              </div>
              <div className={`modal-input ${theme}`}>
                <p className={`${theme}`}>ahrs</p>
                <input
                  placeholder="5003"
                  type="text"
                  value={"5003"}
                  readOnly
                />
              </div>
              <div className={`modal-input ${theme}`}>
                <p className={`${theme}`}>Ultrasonic</p>
                <input
                  placeholder="5004"
                  type="text"
                  value={"5004"}
                  readOnly
                />
              </div>
              <div className={`modal-input ${theme}`}>
                <p className={`${theme}`}>Load cell</p>
                <input
                  placeholder="5005"
                  type="text"
                  value={"5005"}
                  readOnly
                />
              </div>
              <div className={`modal-input ${theme}`}>
                <p className={`${theme}`}>Temp humidity</p>
                <input
                  placeholder="5006"
                  type="text"
                  value={"5006"}
                  readOnly
                />
              </div>
              <div className={`modal-input ${theme}`}>
                <p className={`${theme}`}>Weather station</p>
                <input
                  placeholder="5007"
                  type="text"
                  value={"5007"}
                  readOnly
                />
              </div>
              <div className={`modal-input-horizontal ${theme}`}>
                <div className={`modal-input ${theme}`}>
                  <p className={`${theme}`}>Relay (IP)</p>
                  <input
                    placeholder="192.168.0.102"
                    type="text"
                    value={form.relayIp}
                    onChange={(e) => handleChange(e.target.value, "relayIp")}
                  />
                </div>
                <div className={`modal-input ${theme}`}>
                  <p className={`${theme}`}>Relay (PORT)</p>
                  <input
                    placeholder="4197"
                    type="text"
                    value={form.relayPort}
                    onChange={(e) => handleChange(e.target.value, "relayPort")}
                  />
                </div>
              </div>
              <div className={`modal-btn-group ${theme}`}>
                <button onClick={handleSubmit}>Save</button>
              </div>
            </div>
        }
      </div>
    </div>
  );
};

export default Modal;
