import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";
import HighchartsGauge from "highcharts/modules/solid-gauge";
import { getGaugeOptions } from "../constant";
import { ThemeContext } from "../ThemeHandler";
import Modal from "./Modal";
import Compass from "./compass";
import RollMeter from "./RollMeter";
import { fetchDataUtil, weatherstationData, digitalCompassData, ballonetSensorData, heliumSensorData, adamsData, eBoxData } from "../utils";

HighchartsMore(Highcharts);
HighchartsGauge(Highcharts);
const Home2 = () => {
  const [form, setForm] = useState({
    ip: "192.168.0.102",
    weather: "4002",
    hmr: "4003",
    ballonet: "4004",
    helium: "4005",
    adam: "4006",
    ebox: "4007",
  });
  const [openModal, setOpenModal] = useState(false);
  const [responses, setResponses] = useState({});

  const fetchData = async () => {
    try {
      const results = await fetchDataUtil(form);
      const encoder = new TextEncoder();

      const str = '$HCHDT,128.0,T*22\r\n$WIMDA,29.2878,I,0.9918,B,18.8,C,,,,,,,,,,,,,,*36\r\n$WIMWV,158.4,R,1.9,N,A*23\r\n';
      results[0] = encoder.encode(str).buffer;

      const compassStr = '$PTNTHPR,240.1,N,0.8,N,2.2,N*3B\r\n';
      results[1] = encoder.encode(compassStr).buffer;

      const ballonetStr = '?01CP=0.0712\r\n';
      results[2] = encoder.encode(ballonetStr).buffer;

      const heliumStr = '?01CP=-0.3984\r\n';
      results[3] = encoder.encode(heliumStr).buffer;

      const parsedResponses = {
        weather: weatherstationData(results[0]),
        digitalCompass: digitalCompassData(results[1]),
        ballonet: ballonetSensorData(results[2]),
        helium: heliumSensorData(results[3]),
        adams: adamsData(results[4]),
        ebox: eBoxData(results[5]),
      };

      setResponses(parsedResponses);
    } catch (error) {
      console.error("Error in fetchData:", error);
    }
  };

  useEffect(() => {
    // console.log(responses,"HELOOOOOOOOOOOOOOOO*********");
    if (form.ip) {
      const interval = setInterval(fetchData, 1000);
      return () => clearInterval(interval);
    }
  }, [form]);

  const handleClose = () => {
    setOpenModal(false);
    setErrorValues([]);
    setForm({
      ip: "",
      weather: "",
      hmr: "",
      ballonet: "",
      helium: "",
      adam: "",
      ebox: "",
    })
  };

  const [errorValues, setErrorValues] = useState([]);

  const handleSubmit = () => {
    const errors = [];

    // Regular expression to validate IPv4 addresses
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;

    Object.keys(form).forEach(key => {
      // Check for empty values
      if (form[key].trim() === "") {
        errors.push(key);
      }
    });

    // Validate IP address format if it exists in the form
    if (form.ip && !ipRegex.test(form.ip.trim())) {
      errors.push('ip');
    }

    setErrorValues(errors);
    if (errors.length > 0) {
      // alert(`Please fill in the following fields: ${errors.join(", ")}`);
      return;
    }

    console.log(form, "success");
    setOpenModal(false);
    setErrorValues([]);
    setForm({
      ip: "",
      weather: "",
      hmr: "",
      ballonet: "",
      helium: "",
      adam: "",
      ebox: "",
    })
  };



  const { theme } = React.useContext(ThemeContext);
  const gaugeOptions = getGaugeOptions(theme);

  const [logFile, setLogFile] = useState("");
  const [fan1, setFan1] = useState(true);
  const [fan2, setFan2] = useState(true);
  const [strobe, setStrobe] = useState(false);
  const [position, setPosition] = useState(false);

  const handleFan1 = () => {
    ////Fan1 functionality
    setFan1(!fan1);
  };
  const handleFan2 = () => {
    ////Fan2 functionality
    setFan2(!fan2);
  };
  const handleStrobe = () => {
    ////Strobe functionality
    setStrobe(!strobe);
  };
  const handlePosition = () => {
    ////Position functionality
    setPosition(!position);
  };
  const handleBrowse = () => {
    console.log(logFile, "logFile")
    ////browse functionality
  };
  const handlePlay = () => {
    ////play functionality
  };
  const handleFrwd = () => {
    ////Forward functionality
  };
  const handleStop = () => {
    ////stop functionality
  };

  return (
    <div className={`home-main-container ${theme}`}>
      <div className="home">
        <div className={`data ${theme}`}>
          <h1>Fri, 30 August 2024, 07:49:01</h1>
          <h1>Live Data</h1>
        </div>
        <div className="breaker"></div>
        <div className="home-main">
          <div className="left">
            <div className={`box1 ${theme}`}>
              <div className={`box-head ${theme}`}>
                <h1>Data Logging</h1>
              </div>
              <div className="box-body">
                <div className="box-content">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      rowGap: "10px",
                    }}
                  >
                    <label
                      htmlFor="logFile"
                      style={{
                        color: theme === "light" ? "#000000" : "#F8F8F8",
                        fontWeight: "600",
                      }}
                    >
                      Log File
                    </label>
                    <div className="input-box">
                      <input
                        type="text"
                        id="logFile"
                        placeholder={"Aero/Nw7/Fgs/70082024"}
                        value={logFile}
                        onChange={(e) => setLogFile(e.target.value)}
                      />
                      <button onClick={handleBrowse}>Browse</button>
                    </div>
                  </div>
                  <div className="btn-group">
                    <button onClick={handlePlay}>Play</button>
                    <button onClick={handleFrwd}>FWD</button>
                    <button onClick={handleStop}>Stop</button>
                  </div>
                </div>
              </div>
            </div>
            <div className={`box3 ${theme}`}>
              <div className={`box-head ${theme}`}>
                <h1>Pressures (inWG)</h1>
              </div>
              <div className="box-body">
                <div className="magnetometer-boxes">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={gaugeOptions}
                  />
                  <div style={{ display: "flex", columnGap: "6px", alignItems: "center", position: "relative", bottom: "30px" }}>
                    <p
                      className={`graph-info ${theme}`}
                    >
                      Hull Helium:
                    </p>
                    <span className={`graph-value ${theme}`}>0.12</span>
                  </div>
                </div>
                <div className="magnetometer-boxes">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={gaugeOptions}
                  />
                  <div style={{ display: "flex", columnGap: "6px", alignItems: "center", position: "relative", bottom: "30px" }}>
                    <p
                      className={`graph-info ${theme}`}
                    >
                      Ballonet Air:{" "}
                    </p>
                    <span className={`graph-value ${theme}`}>0.295</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={`box5 ${theme}`}>
              <div className={`box-head ${theme}`}>
                <h1>Confluence Point Tension</h1>
              </div>
              <div className="box-body">
                <div className="single-column-box">
                  <div className="graph-box">
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={gaugeOptions}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      rowGap: "10px",
                    }}
                    className="text-box"
                  >
                    <div style={{ display: "flex", columnGap: "6px", alignItems: "center", position: "relative", bottom: "30px" }}>
                      <p className={`graph-info ${theme}`}>
                        Tension:
                      </p>
                      <span className={`graph-value ${theme}`}>1</span>
                    </div>
                    <div style={{ display: "flex", columnGap: "6px", alignItems: "center", position: "relative", bottom: "30px" }}>
                      <p className={`graph-info ${theme}`}>
                        Max Tension:
                      </p>
                      <span className={`graph-value ${theme}`}>1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="right">
            <div className={`box2 ${theme}`}>
              <div className={`box-head ${theme}`}>
                <h1>Magnetometer</h1>
              </div>

              <div className="box-body3">
                <div className="weather-boxes" style={{ rowGap: "20px" }}>
                  {/* <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      rowGap: "10px",
                    }}
                  > */}
                  <div style={{ display: "flex", columnGap: "6px", alignItems: "center" }}>
                    <p className={`graph-info ${theme}`}>
                      Heading:
                    </p>
                    <span className={`graph-value ${theme}`}>23.9</span>
                  </div>
                  {/* </div> */}
                  <Compass variant="single" heading={40} />
                </div>
                <div className="weather-boxes" style={{ rowGap: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      rowGap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", columnGap: "6px", alignItems: "center" }}>
                      <p className={`graph-info ${theme}`}>
                        Pitch:
                      </p>
                      <span className={`graph-value ${theme}`}>0.2 Deg</span>
                    </div>
                    <div style={{ display: "flex", columnGap: "6px", alignItems: "center" }}>
                      <p className={`graph-info ${theme}`}>
                        Roll:
                      </p>
                      <span className={`graph-value ${theme}`}>3.9 Deg</span>
                    </div>
                  </div>
                  <RollMeter pitch={0} roll={0} />
                </div>
              </div>
            </div>
            <div className="box4">
              <div className={`control-box ${theme}`}>
                <div className={`box-head ${theme}`}>
                  <h1>Radio Link</h1>
                </div>
                <div className="box-body2">
                  <div className="statuses">
                    <div className={`status-box ${theme}`}>
                      <p>Coms Status:</p>
                      <div className="load active"></div>
                      <p>Connected</p>
                    </div>
                    <div className="loader"></div>
                    <div
                      style={{ display: "flex", justifyContent: "center" }}
                      className="btn-group"
                    >
                      <button
                        style={{ cursor: "pointer" }}
                        onClick={() => setOpenModal(true)}
                      >
                        Config
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`control-box ${theme}`}>
                <div className={`box-head ${theme}`}>
                  <h1>Fans Control</h1>
                </div>
                <div className="box-body2">
                  <div className="statuses">
                    <div className={`status-box ${theme}`}>
                      <p style={{ width: "40%" }}>Fan 1:</p>
                      <div
                        onClick={handleFan1}
                        className={`status ${fan1 ? "active" : "inactive"}`}
                      >
                        {fan1 ? "On" : "Off"}
                      </div>
                    </div>
                    <div className={`status-box ${theme}`}>
                      <p style={{ width: "40%" }}>Fan 2:</p>
                      <div
                        onClick={handleFan2}
                        className={`status ${fan2 ? "active" : "inactive"}`}
                      >
                        {fan2 ? "On" : "Off"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`control-box ${theme}`}>
                <div className={`box-head ${theme}`}>
                  <h1>Lights Control</h1>
                </div>
                <div className="box-body2">
                  <div className="statuses">
                    <div className={`status-box ${theme}`}>
                      <p style={{ width: "65%" }}>Strobe Control:</p>
                      <div
                        onClick={handleStrobe}
                        className={`status ${strobe ? "active" : "inactive"}`}
                      >
                        {strobe ? "On" : "Off"}
                      </div>
                    </div>
                    <div className={`status-box ${theme}`}>
                      <p style={{ width: "65%" }}>Position Control:</p>
                      <div
                        onClick={handlePosition}
                        className={`status ${position ? "active" : "inactive"}`}
                      >
                        {position ? "On" : "Off"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`box2 ${theme}`}>
              <div className={`box-head ${theme}`}>
                <h1>Weather Station</h1>
              </div>
              <div className="box-body3">
                <div className="weather-boxes" style={{ rowGap: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      rowGap: "10px",
                    }}
                  >
                    <p
                      // style={{
                      //   fontSize: "16px",
                      //   fontWeight: "600",
                      //   textAlign: "center",
                      //   color: "#FF0000",
                      // }}
                      className="custom-desc"
                    >
                      Aerostat Heading
                    </p>
                    <p
                      // style={{
                      //   fontSize: "16px",
                      //   fontWeight: "600",
                      //   textAlign: "center",
                      //   color: "#0075FF",
                      // }}
                      className="custom-desc2"
                    >
                      Wind Angle
                    </p>
                  </div>
                  <Compass variant="double" heading={45} angle={315} />
                </div>
                <div className="weather-boxes">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      rowGap: "10px",
                    }}
                    className="text-box"
                  >
                    <div style={{ display: "flex", columnGap: "6px", alignItems: "center" }}>
                      <p className={`graph-info ${theme}`}>
                        Air Temp (c):
                        <span className={`graph-value ${theme}`}>15</span>
                      </p>
                    </div>
                    <div style={{ display: "flex", columnGap: "6px", alignItems: "center" }}>
                      <p className={`graph-info ${theme}`}>
                        Bare Pres (intig):
                      </p>
                      <span className={`graph-value ${theme}`}>292</span>
                    </div>
                  </div>
                  <div className="graph-box">
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={gaugeOptions}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        theme={theme}
        open={openModal}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        errorValues={errorValues}
        setErrorValues={setErrorValues}
      />
    </div>
  );
};

export default Home2;
