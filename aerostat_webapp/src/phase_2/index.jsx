import { useEffect, useRef, useState } from "react";
import { details } from "../constant";
import "./phase2.css";
import { fetchDataUtil, getValueForKey, updateConfigUtil, updateToggle } from "../utils";
import Sidebar from "../components/New-Components/Sidebar";
import menuLight from "../assets/menu-light.svg";

function Phase2() {
  const [startFetchData, setStartFetchData] = useState(false)
  const [sideBarOpen, setSidebarOpen] = useState(false)
  const [temprature, setTemprature] = useState("0.00")
  const [humidity, setHumidity] = useState("0.00")
  const [form, setForm] = useState({
    rawtcp_host_ip: "192.168.100.5",
    weather: 4002,
    hmr: 4003,
    ballonet: 4004,
    helium: 4005,
    adam: 4006,
    ebox: 4007,
    modbustcp_host_ip: "192.168.100.5"
  });
  const [apiData, setApiData] = useState([
    { key: "Load Cell Tension:", value: "0.00", unit: null },
    { key: "Roll:", value: "0", unit: null },
    { key: "Wind Direction:", value: "0.00", unit: null },
    { key: "Pitch:", value: "0.00", unit: "°" },
    { key: "Wind Speed:", value: "70.00", unit: "m/s" },
    { key: "Yaw:", value: "0.00", unit: "°" },
    { key: "Temperature:", value: "0.00", unit: "°C" },
    { key: "Longitude:", value: "0.00", unit: null },
    { key: "Humidity:", value: "0.00", unit: "%" },
    { key: "Latitude:", value: "0.00", unit: null },
    { key: "Barometric Pressure:", value: "293.00", unit: "hPa" },
    { key: "Altitude:", value: "0.00", unit: null },
    { key: "Ballonet Curtain:", value: "0.00", unit: null },
    { key: "Position Accuracy", value: "0.00", unit: null },
    { key: "Ballonet Pressure:", value: "0.00", unit: null },
    { key: "Ground Speed:", value: "0.00", unit: null },
    { key: "Hull Pressure:", value: "0.00", unit: null },
    { key: "Heading:", value: "0.00", unit: null },
  ]);

  const lastValidValuesRef = useRef({});

  const isInvalidValue = (value) => {
    return (
      value === undefined ||
      value === "none" ||
      value === null ||
      (typeof value === "string" && value.trim() === "") ||
      isNaN(value)
    );
  };


  const fetchData = async () => {
    const data = await fetchDataUtil();
    if (data) {
      const temperature = data?.port_data?.port_5006?.temperature;
      const humidity = data?.port_data?.port_5006?.humidity;
      const validTemperature = isInvalidValue(temperature)
        ? parseFloat(lastValidValuesRef.current.temperature || '0.00').toFixed(2)
        : parseFloat(temperature).toFixed(2);

      const validHumidity = isInvalidValue(humidity)
        ? parseFloat(lastValidValuesRef.current.humidity || '0.00').toFixed(2)
        : parseFloat(humidity).toFixed(2);
      setTemprature(validTemperature)
      setHumidity(validHumidity)

      const updatedData = apiData.map((item) => {
        const newValue = getValueForKey(item.key, data);


        if (isInvalidValue(newValue)) {
          return {
            ...item,
            value: lastValidValuesRef.current[item.key] || 0,
          };
        }


        lastValidValuesRef.current[item.key] = newValue;
        return { ...item, value: newValue };
      });

      setApiData(updatedData);

    };
  }

  useEffect(() => {
    const updateConfigurations = async () => {
      try {

        const result = await updateToggle(true);


        await updateConfigUtil(form);
        setStartFetchData(true)

      } catch (error) {
        console.error("Error during update:", error);
      }
    };

    updateConfigurations();
  }, [form]);

  useEffect(() => {
    if (startFetchData) {
      fetchData();
      const intervalId = setInterval(fetchData, 1000);
      return () => clearInterval(intervalId);
    }
  }, [startFetchData])

  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
      setCurrentTime(formattedTime);
    };

    updateTime(); // Initial call
    const timeInterval = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(timeInterval); // Cleanup interval
  }, []);

  return (
    <div className="alpha2">
      <div className="time border">
        <div className='menu-parent-phase2'>
          <div onClick={() => setSidebarOpen(true)} className={`menu-icon-phase2`}>
            <img src={menuLight} alt="menu-icon-phase2" />
          </div>
        </div>
        {/* <div>Tuesday, December 24 2024, 03:38:33 PM</div> */}
        <div>{currentTime}</div>
      </div>
      <div className="header">
        <div className="logo border">Logo not found</div>
        <div className="project border">
          <p>AlfaOPS - Telemetry & Control Dashboard 1.0</p>
        </div>
        <div className="cor border">
          <h2>AlfaCOR</h2>
          <div className="border">Temperature: {temprature}</div>
          <div className="border">Humidity: {humidity}</div>
        </div>
      </div>
      <Sidebar
        open={sideBarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="details-container">
        {apiData.map((detail) => (
          <div key={detail.key} className="details">
            <p className="detail-key border">{detail.key}</p>
            <p className="detail-value border">{detail.value} {detail?.unit}</p>
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

export default Phase2;
