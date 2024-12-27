import './App.css';
import { details } from "./constant";

function App() {
  return (
    <div className="alpha2">
      <div className="time border">
        <div>Tuesday, December 24 2024, 03:38:33 PM</div>
      </div>

      <div className="header">
        <div className="logo border">Logo not found</div>
        <div className="project border">
          <p>AlfaOPS - Telemetry & Control Dashboard 1.0</p>
        </div>
        <div className="cor border">
          <h2>AlfaCOR</h2>
          <div className="border">Temperature: Error</div>
          <div className="border">Humidity: Error</div>
        </div>
      </div>

      <div className="details-container">
        {details.map((detail) => (
          <div key={detail.key} className="details">
            <p className="detail-key border">{detail.key}</p>
            <p className="detail-value border">{detail.value}</p>
          </div>
        ))}
      </div>

      <div className="footer border">
        <h2 className="footer-heading">Relay Controls</h2>
        <p className="footer-value">Primary Blower: OFF</p>
        <p className="footer-value">Secondary Blower: OFF</p>
        <p className="footer-value">Strobe Lights: OFF</p>
        <p className="footer-value">Payload Power: OFF</p>
      </div>
    </div>
  );
}

export default App;
