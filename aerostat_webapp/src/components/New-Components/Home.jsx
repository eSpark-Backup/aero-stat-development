import React, { useContext, useState, useEffect, useRef } from 'react'
import MainCard from '../../common/MainCard'
import ChildCard from '../../common/ChildCard'
import StatusChip from '../../common/StatusChip'
import NewCompass from './NewCompass'
import play from "../../assets/play.svg"
import forward from "../../assets/forward.svg"
import stop from "../../assets/stop.svg"
import ChartsData from '../../common/ChartsData'
import OptionBox from '../../common/OptionBox'
import ChartChip from '../../common/ChartChip'
import NewRollMeter from './NewRollMeter'

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";
import HighchartsGauge from "highcharts/modules/solid-gauge";
import { confluenceGaugeOptions, pressureGaugeOptions, windGaugeOptions } from '../../constant'
import { ThemeContext } from '../../ThemeHandler'
import { useWindowWidth, sendDeviceCommands } from '../../utils'
import Modal from '../Modal'
import { formatDateTime } from '../../Js_parsing'

HighchartsMore(Highcharts);
HighchartsGauge(Highcharts);

const Home = ({ handleSubmit, errorValues, setErrorValues, response, isLoading, openModal, setOpenModal, handleOpenModal, fetchingStart, HandleBrowse, fileName, HandlePlay, HandleForward, HandleStop, playBtn, fwdBtn, StopBtn

}) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const width = useWindowWidth();
  const getChartSize = () => (width >= 1280 && width <= 1440) ? 200 : 260
  const getCompassSize = () => (width >= 1280 && width <= 1440) ? true : false;
  // const [openModal, setOpenModal] = useState(false);

  const [fan1, setFan1] = useState("Continuous");
  const [fan2, setFan2] = useState("Off");
  const [light, setLight] = useState("Off");
  const [sendData, setSendData] = useState(false);

  const handleChange = (name, value) => {
    if (fetchingStart) {
      switch (name) {
        case 'fan1':
          setFan1(value);
          setSendData(true);
          break;
        case 'fan2':
          setFan2(value);
          setSendData(true);
          break;
        case 'light':
          setLight(value);
          setSendData(true);
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    let FansLight = {
      Fans: null,
      Lights: null
    };
    if (fan1 === "Continuous" && fan2 === "Continuous") {
      FansLight.Fans = "@01DO00\r";
    } else if (fan1 === "Continuous" && fan2 === "Off") {
      FansLight.Fans = "@01DO02\r";
    } else if (fan1 === "Pressured" && fan2 === "Continuous") {
      FansLight.Fans = "@01DO01\r";
    } else if (fan1 === "Pressured" && fan2 === "Off") {
      FansLight.Fans = "@01DO03\r";
    }
    // if (strobe === "Continuous" && position === "Continuous") {
    //     FansLight.Lights = "@01DO10\r";
    // } else if (strobe === "Continuous" && position === "Off") {
    //     FansLight.Lights = "@01DO12\r";
    // } else if (strobe === "Off" && position === "Continuous") {
    //     FansLight.Lights = "@01DO11\r";
    // } else if (strobe === "Off" && position === "Off") {
    //     FansLight.Lights = "@01DO13\r";
    // }
    if (light === "Off") {
      FansLight.Lights = "@01DO12\r";
    }
    else if (light === "On") {
      FansLight.Lights = "@01DO11\r";
    }
    if (sendData) {
      sendDeviceCommands(FansLight)
        .then((response) => {
          const result = response?.ButtonResponse.split(",");
          setFan1(result[2].toLowerCase() === "off" ? "Pressured" : "Continuous");
          setFan2(result[3].toLowerCase() === "off" ? "Off" : "Continuous");
          setLight(result[4].toLowerCase().startsWith("off") ? "Off" : "On");
          // setPosition(result[5].toLowerCase()?.startsWith("1") ? "Continuous" : "Off");
        })
        .catch((error) => {
          console.error('Error sending device commands:', error);
        })
        .finally(() => setSendData(false));
    }


  }, [sendData, fan1, fan2, light]);
  

  return (
    <>
      <div className="main">
        <div
          className={`preferences2 ${theme === "light" ? "preferences2-light" : "preferences2-dark"
            }`}
        >
          <p>Preference</p>
          <div
            className={`choice ${theme === "light" ? "choice-light" : "choice-dark"
              }`}
            onClick={toggleTheme}
          >
            {theme === "light" ? (
              <>
                <div className="theme-light"></div>
                <p className="theme-text-light">Light</p>
              </>
            ) : (
              <>
                <p className="theme-text-dark">Dark</p>
                <div className="theme-dark"></div>
              </>
            )}
          </div>
        </div>
        <div className="box1">
          <MainCard title={"Weather Station"}>
            <div className="weather-station-card">
              <ChildCard>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    rowGap: "40px",
                    paddingTop: "10px",
                  }}
                >
                  <NewCompass
                    size={getCompassSize()}
                    needle1={response?.weather?.heading}
                    needle2={response?.weather?.wind_angle}
                  />
                  <div className="weather-station-chips">
                    <StatusChip color={"blue"} description={"Wind Angle"} />
                    <StatusChip
                      color={"red"}
                      description={"Aerostat Heading"}
                    />
                  </div>
                </div>
              </ChildCard>
            </div>
          </MainCard>
          <MainCard title={"Wind Speed"}>
            <div className="wind-speed-card">
              <HighchartsReact
                highcharts={Highcharts}
                options={windGaugeOptions(
                  theme,
                  0,
                  70,
                  [
                    parseFloat(response?.weather?.wind_speed) > 70
                      ? 70
                      : parseFloat(response?.weather?.wind_speed) < 0
                        ? 0
                        : parseFloat(response?.weather?.wind_speed),
                  ],
                  getChartSize()
                )}
              />
              <ChartsData
                position={"between"}
                description1={"Air Temp (C):"}
                value1={parseFloat(response?.weather?.air_temp).toFixed(2)}
                description2={"Baro Press (inHg):"}
                value2={parseFloat(response?.weather?.baro_presssure).toFixed(2)}
                graphValue={parseFloat(response?.weather?.wind_speed).toFixed(2)}
                graphName={"Wind Speed"}
                unit={"Knots"}
              />
            </div>
          </MainCard>
        </div>
        <div className="box2">
          <div
            className={`preferences ${theme === "light" ? "preferences-light" : "preferences-dark"
              }`}
          >
            <p>Preference</p>
            <div
              className={`choice ${theme === "light" ? "choice-light" : "choice-dark"
                }`}
              onClick={toggleTheme}
            >
              {theme === "light" ? (
                <>
                  <div className="theme-light"></div>
                  <p className="theme-text-light">Light</p>
                </>
              ) : (
                <>
                  <p className="theme-text-dark">Dark</p>
                  <div className="theme-dark"></div>
                </>
              )}
            </div>
          </div>
          <MainCard title={"Magnetometer"}>
            <div className="magnetometer-box">
              <div className="heading-box">
                <ChildCard>
                  <div className="heading-box-content">
                    <ChartChip
                      name={"Heading"}
                      value={parseFloat(
                        response?.digitalCompass?.mag_heading
                      ).toFixed(2)}
                      unit={"°"}
                    />
                    <NewCompass
                      size={getCompassSize()}
                      needle1={response?.digitalCompass?.mag_heading}
                    />
                  </div>
                </ChildCard>
              </div>
              <div className="heading-box2">
                <ChildCard>
                  <div className="pitch-box-content">
                    <div className="pitch-roll-chips">
                      <ChartChip
                        name={"Roll:"}
                        value={parseFloat(
                          response?.digitalCompass?.roll
                        ).toFixed(2)}
                        unit={"°"}
                      />
                      <ChartChip
                        name={"Pitch:"}
                        value={parseFloat(
                          response?.digitalCompass?.pitch
                        ).toFixed(2)}
                        unit={"°"}
                      />
                    </div>
                    <NewRollMeter
                      roll={response?.digitalCompass?.roll}
                      pitch={response?.digitalCompass?.pitch}
                    />
                  </div>
                </ChildCard>
              </div>
            </div>
          </MainCard>
          <div className="horizontal-box1">
            <div className="pressure-box">
              <MainCard title={"Pressures (inWG)"}>
                <div className="pressure-box-content">
                  <div>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={pressureGaugeOptions(
                        theme,
                        0,
                        6,
                        [
                          parseFloat(response?.helium?.hel_pressure) > 6
                            ? 6
                            : parseFloat(response?.helium?.hel_pressure) < 0
                              ? 0
                              : parseFloat(response?.helium?.hel_pressure),
                        ],
                        getChartSize()
                      )}
                    />
                    <ChartsData
                      position={"around"}
                      graphValue={parseFloat(
                        response?.helium?.hel_pressure
                      ).toFixed(2)}
                      graphName={"Hull Helium"}
                    />
                  </div>
                  <div>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={pressureGaugeOptions(
                        theme,
                        0,
                        6,
                        [
                          parseFloat(response?.ballonet?.bal_pressure) > 6
                            ? 6
                            : parseFloat(response?.ballonet?.bal_pressure) < 0
                              ? 0
                              : parseFloat(response?.ballonet?.bal_pressure),
                        ],
                        getChartSize()
                      )}
                    />
                    <ChartsData
                      position={"around"}
                      graphValue={parseFloat(
                        response?.ballonet?.bal_pressure
                      ).toFixed(2)}
                      graphName={"Ballonet Air"}
                    />
                  </div>
                </div>
              </MainCard>
            </div>
            <div className="confluence-box">
              <MainCard title={"Confluence Point Tension"}>
                <div className="confluence-box-content">
                  <ChartChip
                    name={"Max Tension"}
                    value={parseFloat(response?.adams?.max_tension).toFixed(2)}
                    unit={"kg"}
                  />
                  <div className="confluence-graph">
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={confluenceGaugeOptions(
                        theme,
                        0,
                        700,
                        [
                          parseFloat(response?.adams?.tension) > 700
                            ? 700
                            : parseFloat(response?.adams?.tension) < 0
                              ? 0
                              : parseFloat(response?.adams?.tension),
                        ],
                        getChartSize()
                      )}
                    />
                    <ChartsData
                      position={"center"}
                      graphName={"Current Tension"}
                      graphValue={parseFloat(response?.adams?.tension).toFixed(
                        2
                      )}
                      unit={"Kg"}
                    />
                  </div>
                </div>
              </MainCard>
            </div>
          </div>
        </div>
      </div>

      <div className="main2">
        <MainCard title={"Controls & Radio Link"}>
          <div className="control-box-card">
            <div
              className={`controls-box ${theme === "light" ? "controls-box-light" : "controls-box-dark"
                }`}
            >
              <h2>Fan Control</h2>
              <div
                className={`fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"
                  }`}
              >
                <p>
                  Fan 1 <span>(Left direction)</span>
                </p>
                <OptionBox
                  fetchingStart={fetchingStart}
                  handleChange={handleChange}
                  name="fan1"
                  option1={"Continuous"}
                  option2={"Pressured"}
                  selectedOption={fan1}
                />
              </div>
              <div
                className={`fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"
                  }`}
              >
                <p>
                  Fan 2 <span>(Right direction)</span>
                </p>
                <OptionBox
                  fetchingStart={fetchingStart}
                  handleChange={handleChange}
                  name="fan2"
                  option1={"Continuous"}
                  option2={"Off"}
                  selectedOption={fan2}
                />
              </div>
              {/* <h2 style={{ textAlign: "center" }}>Strobe Lights Control</h2> */}
              {/* <div className={`fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"}`}>
                                <p>Strobe Control</p>
                                <OptionBox fetchingStart={fetchingStart} handleChange={handleChange} name="strobe" option1={"Continuous"} option2={"Off"} selectedOption={strobe} />
                            </div> */}
              <div
                className={`strobe fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"
                  }`}
              >
                <p>Strobe Lights Control</p>
                <OptionBox
                  fetchingStart={fetchingStart}
                  handleChange={handleChange}
                  name="light"
                  option1={"On"}
                  option2={"Off"}
                  selectedOption={light}
                />
              </div>
            </div>
            <div
              className={`log-detail ${theme === "light" ? "log-detail-light" : "log-detail-dark"
                }`}
            >
              {/* <p>Tether Link:</p> */}
              <p>Comms Status:</p>
              <StatusChip
                color={"green"}
                description={
                  !fetchingStart
                    ? "Disconnected"
                    : isLoading
                      ? isLoading
                      : "Disconnected"
                }
              />
            </div>
          </div>
        </MainCard>
        <div className="horizontal-box2">
          <div className="log-box">
            <MainCard title={"Data Logging"}>
              <div className="log-box-content">
                <div
                  className={`log-input-box ${theme === "light"
                      ? "log-input-box-light"
                      : "log-input-box-dark"
                    }`}
                >
                  <p>Log File</p>
                  <div
                    className={`file-name-box ${theme === "light"
                        ? "file-name-box-light"
                        : "file-name-box-dark"
                      }`}
                  >
                    {fileName ? fileName : ""}
                  </div>
                  <input
                    type="file"
                    id="fileInput"
                    style={{ display: "none" }}
                    onChange={HandleBrowse}
                    disabled={!playBtn && StopBtn ? true : false}
                  />
                  <label
                    htmlFor="fileInput"
                    className={`custom-file-input ${theme} ${!playBtn && StopBtn ? "disable" : ""
                      }`}
                  >
                    Browse
                  </label>
                </div>
                <div className="button-groups">
                  <div
                    className={`tdbutton ${theme === "light" ? "td-light" : "td-dark"
                      }`}
                  >
                    <button
                      className={`upper-part ${!playBtn ? "disable" : ""}`}
                      disabled={!playBtn}
                      onClick={HandlePlay}
                    >
                      <img src={play} alt="" />
                    </button>
                  </div>
                  <div
                    className={`tdbutton ${theme === "light" ? "td-light" : "td-dark"
                      }`}
                  >
                    <button
                      className={`upper-part ${!fwdBtn ? "disable" : ""}`}
                      disabled={!fwdBtn}
                      onClick={HandleForward}
                    >
                      <img src={forward} alt="" />
                    </button>
                  </div>
                  <div
                    className={`tdbutton ${theme === "light" ? "td-light" : "td-dark"
                      }`}
                  >
                    <button
                      className={`upper-part ${!StopBtn ? "disable" : ""}`}
                      disabled={!StopBtn}
                      onClick={HandleStop}
                    >
                      <img src={stop} alt="" />
                    </button>
                  </div>
                </div>
              </div>
            </MainCard>
          </div>
        </div>
      </div>
      <Modal
        theme={theme}
        open={openModal}
        handleClose={() => setOpenModal(false)}
        handleSubmit={handleSubmit}
        errorValues={errorValues}
        setErrorValues={setErrorValues}
      />
    </>
  );
};

export default Home;
