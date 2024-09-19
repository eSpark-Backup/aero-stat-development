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
  const [isLoading, setIsLoading] = useState(true);
  const [fan1, setFan1] = useState(null);
  const [fan2, setFan2] = useState(null);
  const [strobe, setStrobe] = useState(null);
  const [position, setPosition] = useState(false);
  const [data, setData] = useState({});

  const fetchData = async () => {
    try {
      const results = await fetchDataUtil();
      const weatherdata = weatherstationData(results.port_4002);
      const digitalCompassdata = digitalCompassData(results.port_4003);
      const ballonetSensordata = ballonetSensorData(results.port_4004);
      const heliumSensordata = heliumSensorData(results.port_4005);
      const adamsdata = adamsData(results.port_4006);
      const eBoxdata = eBoxData(results.port_4007);

      const parsedResponses = {
        weather: weatherdata,
        digitalCompass: digitalCompassdata,
        ballonet: ballonetSensordata,
        helium: heliumSensordata,
        adams: adamsdata,
        ebox: eBoxdata,
      };

      setResponses(parsedResponses);
      setIsLoading(false)
    } catch (error) {
      console.error("Error in fetchData:", error);
      setIsLoading(false)
    }
  };

  useEffect(() => {
    // if (1) {
    fetchData();
    const interval = setInterval(fetchData, 3500);
    return () => clearInterval(interval);
    // }
  }, []);

  useEffect(() => {
    if (responses?.ebox) {
      setFan1(responses?.ebox?.fan1 === "ON");
      setFan2(responses?.ebox?.fan2 === "ON");
      setStrobe(responses?.ebox?.strobe === "ON");
      setPosition(responses?.ebox?.position == "1");
    }
  }, [responses]);

  useEffect(() => {
    console.log(data)
  }, [data])

  const handleClose = () => {
    setOpenModal(false);
    setErrorValues([]);
    setForm({
      ip: "192.168.0.102",
      weather: "4002",
      hmr: "4003",
      ballonet: "4004",
      helium: "4005",
      adam: "4006",
      ebox: "4007",
    })
  };

  const [errorValues, setErrorValues] = useState([]);

  const handleSubmit = async () => {
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

    try {
      const response = await fetch("https://jsonplaceholder.typicodes.com/posts", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify(form),
      })
      if (response.ok) {
        const result = await response.json();
        console.log("Form successfully posted:");
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
      }
    } catch (error) {
      console.log("Error in form posting:", error);
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
    }

  };

  const { theme } = React.useContext(ThemeContext);
  const gaugeOptions = getGaugeOptions(theme);

  const [logFile, setLogFile] = useState("");


  const HanldeStatusSubmit = async (data) => {
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        const result = await response.json();
        console.log("Data successfully posted:");
      }
    } catch (error) {
      console.log("Error in posting:", error);
    }
  }

  const handleFan1 = () => {
    setFan1(prevFan1 => {
      const newFan1 = !prevFan1;

      const newData = {
        ...(newFan1 && fan2 ? { Fans: "@01DO00\r" } : {}),
        ...(newFan1 && !fan2 ? { Fans: "@01DO02\r" } : {}),
        ...(!newFan1 && fan2 ? { Fans: "@01DO01\r" } : {}),
        ...(!newFan1 && !fan2 ? { Fans: "@01DO03\r" } : {}),

        ...(strobe && position ? { Lights: "@01DO10\r" } : {}),
        ...(strobe && !position ? { Lights: "@01DO12\r" } : {}),
        ...(!strobe && position ? { Lights: "@01DO11\r" } : {}),
        ...(!strobe && !position ? { Lights: "@01DO13\r" } : {}),
      };

      setData(newData);
      HanldeStatusSubmit(newData);


      return newFan1;
    });
  };

  const handleFan2 = () => {
    setFan2(prevFan2 => {
      const newFan2 = !prevFan2;

      const newData = {
        ...(fan1 && newFan2 ? { Fans: "@01DO00\r" } : {}),
        ...(fan1 && !newFan2 ? { Fans: "@01DO02\r" } : {}),
        ...(!fan1 && newFan2 ? { Fans: "@01DO01\r" } : {}),
        ...(!fan1 && !newFan2 ? { Fans: "@01DO03\r" } : {}),

        ...(strobe && position ? { Lights: "@01DO10\r" } : {}),
        ...(strobe && !position ? { Lights: "@01DO12\r" } : {}),
        ...(!strobe && position ? { Lights: "@01DO11\r" } : {}),
        ...(!strobe && !position ? { Lights: "@01DO13\r" } : {}),
      };

      setData(newData);
      HanldeStatusSubmit(newData)


      return newFan2;
    });
  };
  const handleStrobe = () => {
    setStrobe(prevStrobe => {
      const newStrobe = !prevStrobe;

      const newData = {
        ...(fan1 && fan2 ? { Fans: "@01DO00\r" } : {}),
        ...(fan1 && !fan2 ? { Fans: "@01DO02\r" } : {}),
        ...(!fan1 && fan2 ? { Fans: "@01DO01\r" } : {}),
        ...(!fan1 && !fan2 ? { Fans: "@01DO03\r" } : {}),

        ...(newStrobe && position ? { Lights: "@01DO10\r" } : {}),
        ...(newStrobe && !position ? { Lights: "@01DO12\r" } : {}),
        ...(!newStrobe && position ? { Lights: "@01DO11\r" } : {}),
        ...(!newStrobe && !position ? { Lights: "@01DO13\r" } : {}),
      };

      setData(newData);
      HanldeStatusSubmit(newData)


      return newStrobe;
    });
  };
  const handlePosition = () => {
    setPosition(prevPosition => {
      const newPosition = !prevPosition;

      const newData = {
        ...(fan1 && fan2 ? { Fans: "@01DO00\r" } : {}),
        ...(fan1 && !fan2 ? { Fans: "@01DO02\r" } : {}),
        ...(!fan1 && fan2 ? { Fans: "@01DO01\r" } : {}),
        ...(!fan1 && !fan2 ? { Fans: "@01DO03\r" } : {}),

        ...(strobe && newPosition ? { Lights: "@01DO10\r" } : {}),
        ...(strobe && !newPosition ? { Lights: "@01DO12\r" } : {}),
        ...(!strobe && newPosition ? { Lights: "@01DO11\r" } : {}),
        ...(!strobe && !newPosition ? { Lights: "@01DO13\r" } : {}),
      };

      setData(newData);
      HanldeStatusSubmit(newData)


      return newPosition;
    });
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

  useEffect(() => {
    console.log("Parsed Responses after each second:", responses);
  }, [responses])

  return (
    <>
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
                      options={getGaugeOptions(theme, -1, 6, [responses?.helium?.HelPressure || 2.3])}
                    />
                    <div style={{ display: "flex", columnGap: "6px", alignItems: "center", position: "relative", bottom: "30px" }}>
                      <p
                        className={`graph-info ${theme}`}
                      >
                        Hull Helium:
                      </p>
                      <span className={`graph-value ${theme}`}>{responses?.helium?.HelPressure ? responses?.helium?.HelPressure : 2.3}</span>
                    </div>
                  </div>
                  <div className="magnetometer-boxes">
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={getGaugeOptions(theme, 0, 6, [responses?.ballonet?.BalPressure || 2.3])}
                    />
                    <div style={{ display: "flex", columnGap: "6px", alignItems: "center", position: "relative", bottom: "30px" }}>
                      <p
                        className={`graph-info ${theme}`}
                      >
                        Ballonet Air:
                      </p>
                      <span className={`graph-value ${theme}`}>{responses?.ballonet?.BalPressure ? responses?.ballonet?.BalPressure : 2.3}</span>
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
                        options={getGaugeOptions(theme, 0, 750, [responses?.adams?.Tension || 0])}
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
                        <span className={`graph-value ${theme}`}>{responses?.adams?.Tension ? responses?.adams?.Tension : 0.0}</span>
                      </div>
                      <div style={{ display: "flex", columnGap: "6px", alignItems: "center", position: "relative", bottom: "30px" }}>
                        <p className={`graph-info ${theme}`}>
                          Max Tension:
                        </p>
                        <span className={`graph-value ${theme}`}>{responses?.adams?.MaxTension ? responses?.adams?.MaxTension : 310.0}</span>
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
                      <span className={`graph-value ${theme}`}>{responses?.digitalCompass?.Magheading}</span>
                    </div>
                    <Compass variant="single" heading={responses?.digitalCompass?.Magheading} />
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
                        <span className={`graph-value ${theme}`}>{responses?.digitalCompass?.Pitch ? responses?.digitalCompass?.Pitch : 6} Deg</span>
                      </div>
                      <div style={{ display: "flex", columnGap: "6px", alignItems: "center" }}>
                        <p className={`graph-info ${theme}`}>
                          Roll:
                        </p>
                        <span className={`graph-value ${theme}`}>{responses?.digitalCompass?.Roll ? responses?.digitalCompass?.Roll : 6} Deg</span>
                      </div>
                    </div>
                    <RollMeter pitch={responses?.digitalCompass?.Pitch ? responses?.digitalCompass?.Pitch : 6} roll={responses?.digitalCompass?.Roll ? responses?.digitalCompass?.Roll : 6} />
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
                        <div className={`load ${isLoading ? "inactive2 " : "active"}`}></div>
                        <p>{isLoading ? "Loading..." : "Connected"}</p>
                      </div>
                      <div className={`${isLoading ? "loader-incomplete" : "loader-complete"}`}></div>
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
                    <Compass variant="double" heading={responses?.weather?.heading} angle={responses?.weather?.windAngle} />
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
                          <span className={`graph-value ${theme}`}>{responses?.weather?.airTemp}</span>
                        </p>
                      </div>
                      <div style={{ display: "flex", columnGap: "6px", alignItems: "center" }}>
                        <p className={`graph-info ${theme}`}>
                          Bare Pres (intig):
                        </p>
                        <span className={`graph-value ${theme}`}>{responses?.weather?.baroPres}</span>
                      </div>
                    </div>
                    <div className="graph-box">
                      <HighchartsReact
                        highcharts={Highcharts}
                        options={getGaugeOptions(theme, 0, 70, [responses?.weather?.windSpeed || 60])}
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
    </>
  );
};

export default Home2;
