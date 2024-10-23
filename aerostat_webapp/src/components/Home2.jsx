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
import { fetchDataUtil } from "../utils";
import { formatDateTime, processData, processDataArray } from "../Js_parsing";

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
  const [playBtn, setPlayBtn] = useState(false);
  const [fwdBtn, setFwdBtn] = useState(false);
  const [stopBtn, setStopBtn] = useState(false);
  const [data, setData] = useState({});
  const [fileContent, setFileContent] = useState('');
  const [startFetchingFromFile, setStartFetchingFromFile] = useState(false);
  const [fileData, setfileData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentResult, setCurrentResult] = useState(null);
  const [fetchingSpeed, setFetchingSpeed] = useState(1000);
  const [headerText, setHeaderText] = useState("Live Data");

  const fetchData = async () => {
    try {
      const results = await fetchDataUtil();
      const parsedResponses = {
        weather: weatherdata,
        digitalCompass: digitalCompassdata,
        ballonet: ballonetSensordata,
        helium: heliumSensordata,
        adams: adamsdata,
        ebox: eBoxdata,
        time: formatDateTime()
      };

      setResponses(parsedResponses);
      setIsLoading(false)
    } catch (error) {
      console.error("Error in fetchData:", error);
      setIsLoading(null)
    }
  };

  useEffect(() => {
    if (!startFetchingFromFile) {
      fetchData();
      const interval = setInterval(fetchData, 1000);
      return () => clearInterval(interval);
    }
  }, [startFetchingFromFile]);

  useEffect(() => {
    if (responses?.ebox) {
      setFan1(responses?.ebox?.fan1 === "ON");
      setFan2(responses?.ebox?.fan2 === "ON");
      setStrobe(responses?.ebox?.strobe === "ON");
      setPosition(responses?.ebox?.position == "1");
    }

  }, [responses]);


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


    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;

    Object.keys(form).forEach(key => {
      if (form[key].trim() === "") {
        errors.push(key);
      }
    });


    if (form.ip && !ipRegex.test(form.ip.trim())) {
      errors.push('ip');
    }

    setErrorValues(errors);
    if (errors.length > 0) {
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/update-config", {
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
        setStartFetchingFromFile(false);
        setFwdBtn(false);
        setPlayBtn(false);
        setHeaderText("LIVE DATA");
        setFileContent("");
        setLogFile("");
        setStopBtn(false)
        setFetchingSpeed(1000);
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
      const response = await fetch("http://localhost:5000/send-device-commands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        const result = await response.json();
        console.log("Data successfully posted:", result);
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
  const handleBrowse = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogFile(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    if (fileContent) {
      setPlayBtn(true);
      let res = processData(fileContent)
      setfileData(res);

    }
  }, [fileContent])


  useEffect(() => {
    const intervalId = setInterval(() => {
      if (startFetchingFromFile && currentIndex < fileData.length) {
        const result = processDataArray([fileData[currentIndex]], currentResult);
        console.log(result);
        setCurrentResult(result);
        setResponses(result);

        setCurrentIndex(prevIndex => prevIndex + 1);
      }
      else if (currentIndex >= fileData.length) {
        setStartFetchingFromFile(false);
        setFwdBtn(false);
        setPlayBtn(false);
        setHeaderText("LIVE DATA");
        setFileContent("");
        setLogFile("");
        setStopBtn(false)
        setFetchingSpeed(1000);
        clearInterval(intervalId);
      }
      else {
        clearInterval(intervalId);
      }
    }, fetchingSpeed);

    return () => clearInterval(intervalId);


  }, [fileData, currentIndex, currentResult, startFetchingFromFile, fetchingSpeed]);

  const handlePlay = () => {
    setStartFetchingFromFile(true);
    setFwdBtn(true);
    setStopBtn(true);
    setHeaderText("PLAYING BACK RECORDED DATA")
    ////play functionality
  };
  const handleFrwd = () => {
    ////Forward functionality
    if (fetchingSpeed > 125) {
      setFetchingSpeed(fetchingSpeed * 0.5);
    }
  };
  const handleStop = () => {
    ////stop functionality
    setStartFetchingFromFile(false);
    setFwdBtn(false);
    setPlayBtn(false);
    setHeaderText("LIVE DATA");
    setFileContent("");
    setLogFile("");
    setStopBtn(false)
    setFetchingSpeed(1000);

  };


  useEffect(() => {
    if (fetchingSpeed == 125) {
      setFwdBtn(false);
    }
  }, [fetchingSpeed])


  return (
    <>
      <div className={`home-main-container ${theme}`}>
        <div className="home">
          <div className={`data ${theme}`}>
            <h1>{responses?.time ? responses?.time : formatDateTime()}</h1>
            <h1>{headerText}</h1>
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
                          disabled
                        // onChange={(e) => setLogFile(e.target.value)}
                        />
                        {/* <button onClick={handleBrowse}>Browse</button>  */}
                        <input
                          type="file"
                          id="fileInput"
                          onChange={handleBrowse}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="fileInput" className={startFetchingFromFile ? "custom-file-input disabled" : "custom-file-input"}>
                          Browse
                        </label>
                      </div>
                    </div>
                    <div className="btn-group">
                      <button disabled={playBtn ? false : true} onClick={handlePlay}>Play</button>
                      <button disabled={fwdBtn ? false : true} onClick={handleFrwd}>FWD</button>
                      <button disabled={stopBtn ? false : true} onClick={handleStop}>Stop</button>
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
                        <div className={`load ${startFetchingFromFile ? "active" : isLoading === true ? "inactive2" : isLoading === false ? "active" : "inactive"}`}></div>
                        <p>{startFetchingFromFile ? "Connected" : isLoading ? "Loading..." : isLoading === false ? "Connected" : "Disconnected"}</p>
                      </div>
                      <div className={`${startFetchingFromFile ? "loader-complete" : isLoading ? "loader-incomplete" : isLoading === false ? "loader-complete" : "loader-disconnect"}`}></div>
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
                          Baro Pres (intig):
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
