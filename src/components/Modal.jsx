import { useEffect } from "react";

const Modal = ({ open, handleClose, handleSubmit, form, setForm, theme }) => {
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
    setForm((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  return (
    <div className={`modal-bg ${open ? "active" : ""}`}>
      <div className={`modal ${theme}`}>
        <div className={`modal-header ${theme}`}>header</div>
        <div className="modal-body">
          <div className="modal-input">
            <p className={`${theme}`}>GCS Address</p>
            <input
              placeholder="192.168.0.102"
              type="text"
              value={form.ip}
              onChange={(e) => handleChange(e.target.value, "ip")}
            />
          </div>
          <div className="modal-input">
            <p className={`${theme}`}>Weather Station Port</p>
            <input
              placeholder="4002"
              type="text"
              value={form.weather}
              onChange={(e) => handleChange(e.target.value, "weather")}
            />
          </div>
          <div className="modal-input">
            <p className={`${theme}`}>HMR Port</p>
            <input
              placeholder="4003"
              type="text"
              value={form.hmr}
              onChange={(e) => handleChange(e.target.value, "hmr")}
            />
          </div>
          <div className="modal-input">
            <p className={`${theme}`}>Ballonet Pressure Port</p>
            <input
              type="text"
              placeholder="4004"
              value={form.ballonet}
              onChange={(e) => handleChange(e.target.value, "ballonet")}
            />
          </div>
          <div className="modal-input">
            <p className={`${theme}`}>Helium Pressure Port</p>
            <input
              type="text"
              placeholder="4005"
              value={form.helium}
              onChange={(e) => handleChange(e.target.value, "helium")}
            />
          </div>
          <div className="modal-input">
            <p className={`${theme}`}>ADAM Port</p>
            <input
              type="text"
              placeholder="4006"
              value={form.adam}
              onChange={(e) => handleChange(e.target.value, "adam")}
            />
          </div>
          <div className="modal-input">
            <p className={`${theme}`}>EBox Port</p>
            <input
              type="text"
              placeholder="4007"
              value={form.ebox}
              onChange={(e) => handleChange(e.target.value, "ebox")}
            />
          </div>
          <div className="modal-btn-group">
            <button className="outlined" onClick={handleClose}>
              Close
            </button>
            <button className="contained" onClick={handleSubmit}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
