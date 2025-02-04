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
import { WebSocketContext } from '../../App'
import useWebSocket from 'react-use-websocket'

HighchartsMore(Highcharts);
HighchartsGauge(Highcharts);

const Home = ({ handleSubmit, errorValues, setErrorValues, response, isLoading, openModal, setOpenModal, handleOpenModal, fetchingStart, HandleBrowse, fileName, HandlePlay, HandleForward, HandleStop, playBtn, fwdBtn, StopBtn

}) => {
  const { theme, toggleTheme, phase } = useContext(ThemeContext);
  const width = useWindowWidth();
  const getChartSize = () => (width >= 1280 && width <= 1440) ? 200 : 260
  const getCompassSize = () => (width >= 1280 && width <= 1440) ? true : false;
  // const [openModal, setOpenModal] = useState(false);

  const [fan1, setFan1] = useState("Continuous");
  const [fan2, setFan2] = useState("Off");
  const [light, setLight] = useState("Off");
  const [primary_blower, setPrimaryBlower] = useState("Off");
  const [secondary_blower, setSecondaryBlower] = useState("Off");
  const [strobe_light, setStrobeLight] = useState("Off");
  const [payload_power, setPayloadPower] = useState("Off");
  const [sendData, setSendData] = useState(false);
  const { sendJsonMessage, lastMessage } = useContext(WebSocketContext);

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
        case 'primary_blower':
          setPrimaryBlower(value);
          setSendData(true);
          break;
        case 'secondary_blower':
          setSecondaryBlower(value);
          setSendData(true);
          break;
        case 'strobe_light':
          setStrobeLight(value);
          setSendData(true);
          break;
        case 'payload_power':
          setPayloadPower(value);
          setSendData(true);
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    let relayControls = {};
    if (phase === 1) {
      relayControls = {
        "method": "alfa.actuator.settings.set",
        "tcp": [
          {
            "name": "tcp1",
            "fan": [
              fan1 === "Pressured" ? 0 : 1,
              fan2 === "Off" ? 0 : 1
            ],
            "strobe_light": [
              light === "On" ? 1 : 0
            ]
          }
        ]
      }
    }
    if (phase === 2) {
      relayControls = {
        "method": "alfa.actuator.settings.set",
        "modbus": [
          {
            "name": "modbus-relay",
            "relay": [
              primary_blower === "On" ? 1 : 0,
              secondary_blower === "On" ? 1 : 0,
              strobe_light === "On" ? 1 : 0,
              payload_power === "On" ? 1 : 0
            ]
          }
        ],
      }
    }
    if (sendData) {
      sendJsonMessage(relayControls)
      console.log("Controls successfully posted:", relayControls);
      setSendData(false)
    }
  }, [sendData, fan1, fan2, light, primary_blower, secondary_blower, strobe_light, payload_power]);

  useEffect(() => {
    if (lastMessage?.data) {
      const data = JSON.parse(lastMessage.data);
      const status = data.status;
      if (status === "success") {
        if (phase === 1) {
          setFan1(data?.settings_set?.tcp?.fan?.fan_one === "OFF" ? "Pressured" : "Continuous")
          setFan2(data?.settings_set?.tcp?.fan?.fan_two === "OFF" ? "Off" : "Continuous")
          setLight(data?.settings_set?.tcp?.strobe_light === "OFF" ? "Off" : "On")
          console.log(`${data?.settings_set?.tcp?.fan?.fan_one} ${data?.settings_set?.tcp?.fan?.fan_two} ${data?.settings_set?.tcp?.strobe_light}`)
        }
        if (phase === 2) {
          setPrimaryBlower(data?.settings_set?.modbus?.relay[0] === 1 ? "On" : "Off")
          setSecondaryBlower(data?.settings_set?.modbus?.relay[1] === 1 ? "On" : "Off")
          setStrobeLight(data?.settings_set?.modbus?.relay[2] === 1 ? "On" : "Off")
          setPayloadPower(data?.settings_set?.modbus?.relay[3] === 1 ? "On" : "Off")
          console.log(data?.settings_set?.modbus?.relay)
        }
      }
    }
  }, [lastMessage]);

  return (
    <>
      <div className="main">
        <div
          className={`preferences2 ${theme === "light" ? "preferences2-light" : "preferences2-dark"
            }`}
        >
          <div className='pref-data-new'>
            <ChartChip
              name={"Temperature:"}
              value={
                phase === 1
                  ? "N/A"
                  : (response?.digitalCompass.temperature === "NaN" || !response?.digitalCompass.temperature
                    ? "N/A"
                    : response?.digitalCompass.temperature)
              }
              unit={"°"}
            />

            <ChartChip
              name={"Humidity:"}
              value={
                phase === 1
                  ? "N/A"
                  : (response?.digitalCompass.humidity === "NaN" || !response?.digitalCompass.humidity
                    ? "N/A"
                    : `${response?.digitalCompass.humidity}%`)
              }
              unit={""}
            />
          </div>
          <div style={{ display: "flex", columnGap: "10px", alignItems: "center" }}>
            <p style={{ fontSize: "20px" }}>Preferences</p>
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
                      description={phase === 1 ? "Aerostat Heading" : "Humidity"}
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
            <div className='pref-data-new'>
              <ChartChip
                name={"Temperature:"}
                value={
                  phase === 1
                    ? "N/A"
                    : (response?.digitalCompass.temperature === "NaN" || !response?.digitalCompass.temperature
                      ? "N/A"
                      : response?.digitalCompass.temperature)
                }
                unit={phase === 1 ? "" : "°"}
              />

              <ChartChip
                name={"Humidity:"}
                value={
                  phase === 1
                    ? "N/A"
                    : (response?.digitalCompass.humidity === "NaN" || !response?.digitalCompass.humidity
                      ? "N/A"
                      : `${response?.digitalCompass.humidity}%`)
                }
                unit={""}
              />
            </div>
            <div className='prefrence-box-new'>
              <p style={{ fontSize: "20px" }}>Preferences</p>
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
          </div>
          <MainCard title={"Magnetometer"}>
            <div className="magnetometer-box">
              <div className="heading-box">
                <ChildCard>
                  <div className={phase === 1 ? `heading-box-content` : `heading-box-content-phase2`}>
                    <div style={{ display: "flex", flexDirection: "column", rowGap: "10px" }}>
                      <ChartChip
                        name={"Heading"}
                        value={parseFloat(
                          response?.digitalCompass?.mag_heading
                        ).toFixed(2)}
                        unit={"°"}
                      />
                      {phase === 2 &&
                        <>
                          <ChartChip
                            name={"Longitude:"}
                            value={response?.weather?.longitude === "NaN" || !response?.weather?.longitude ? "N/A" : `${response?.weather?.longitude}°`}
                            unit={""}
                          />
                          <ChartChip
                            name={"Latitude:"}
                            value={response?.weather?.latitude === "NaN" || !response?.weather?.latitude ? "N/A" : `${response?.weather?.latitude}°`}
                            unit={""}
                          />
                          <ChartChip
                            name={"Altitude:"}
                            value={response?.weather?.altitude === "NaN" || !response?.weather?.altitude ? "N/A" : `${response?.weather?.altitude}m`}
                            unit={""}
                          />
                          <ChartChip
                            name={"Ground Speed:"}
                            value={response?.weather?.ground_speed === "NaN" || !response?.weather?.ground_speed ? "N/A" : `${response?.weather?.ground_speed}m/s`}
                            unit={""}
                          />
                        </>
                      }
                    </div>
                    <NewCompass
                      size={getCompassSize()}
                      needle1={response?.digitalCompass?.mag_heading}
                    />
                  </div>
                </ChildCard>
              </div>
              <div className="heading-box2">
                <ChildCard>
                  <div className={phase === 1 ? `pitch-box-content` : `pitch-box-content-phase2`}>
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
                      {
                        phase === 2 &&
                        <>
                          <ChartChip
                            name={"Yaw:"}
                            value={response?.digitalCompass.yaw === "NaN" || !response?.digitalCompass.yaw ? "N/A" : `${response?.digitalCompass.yaw}°`}
                            unit={""}
                          />
                          <ChartChip
                            name={"Position Accuracy:"}
                            value={response?.digitalCompass.position_accuracy === "NaN" || !response?.digitalCompass.position_accuracy ? "N/A" : `${response?.digitalCompass.position_accuracy}m`}
                            unit={""}
                          />
                        </>
                      }
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
                      position={phase === 1 ? "around" : "between"}
                      graphValue={parseFloat(
                        response?.ballonet?.bal_pressure
                      ).toFixed(2)}
                      graphName={"Ballonet Air"}
                      description1={phase === 2 && "Ballonet Curtain"}
                      // value1={response?.ballonet?.ballonet_height === "NaN" ? "N/A" : `${parseFloat(response?.ballonet?.ballonet_height).toFixed(2)}m`}
                      value1={phase === 2 && (response?.ballonet?.ballonet_height === "NaN" || !response?.ballonet?.ballonet_height) ? "N/A" : phase === 2 && response?.ballonet?.ballonet_height ? response?.ballonet?.ballonet_height : ""}
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
            {
              phase === 1
                ?
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
                      phase={1}
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
                      phase={1}
                    />
                  </div>
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
                      phase={1}
                    />
                  </div>
                </div>
                :
                <div className={`controls-box ${theme === "light" ? "controls-box-light" : "controls-box-dark"
                  }`}>
                  <h2>Relay Controls</h2>
                  <div
                    className={`fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"
                      }`}
                  >
                    <p>
                      Primary Blower
                    </p>
                    <OptionBox
                      fetchingStart={fetchingStart}
                      handleChange={handleChange}
                      name={"primary_blower"}
                      option1={"On"}
                      option2={"Off"}
                      selectedOption={primary_blower}
                      phase={2}
                    />
                  </div>
                  <div
                    className={`fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"
                      }`}
                  >
                    <p>
                      Secondary Blower
                    </p>
                    <OptionBox
                      fetchingStart={fetchingStart}
                      handleChange={handleChange}
                      name={"secondary_blower"}
                      option1={"On"}
                      option2={"Off"}
                      selectedOption={secondary_blower}
                      phase={2}
                    />
                  </div>
                  <div
                    className={`fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"
                      }`}
                  >
                    <p>
                      Strobe Lights
                    </p>
                    <OptionBox
                      fetchingStart={fetchingStart}
                      handleChange={handleChange}
                      name={"strobe_light"}
                      option1={"On"}
                      option2={"Off"}
                      selectedOption={strobe_light}
                      phase={2}
                    />
                  </div>
                  <div
                    className={`fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"
                      }`}
                  >
                    <p>
                      Payload Power
                    </p>
                    <OptionBox
                      fetchingStart={fetchingStart}
                      handleChange={handleChange}
                      name={"payload_power"}
                      option1={"On"}
                      option2={"Off"}
                      selectedOption={payload_power}
                      phase={2}
                    />
                  </div>
                </div>
            }
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
                    disabled={phase === 2 || (!playBtn && StopBtn) ? true : false}
                  />
                  <label
                    htmlFor="fileInput"
                    className={`custom-file-input ${theme} ${phase === 2 || (!playBtn && StopBtn) ? "disable" : ""
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
                      className={`upper-part ${phase === 2 || !playBtn ? "disable" : ""}`}
                      disabled={phase === 2 || !playBtn}
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
                      className={`upper-part ${phase === 2 || !fwdBtn ? "disable" : ""}`}
                      disabled={phase === 2 || !fwdBtn}
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
                      className={`upper-part ${phase === 2 || !StopBtn ? "disable" : ""}`}
                      disabled={phase === 2 || !StopBtn}
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
}

export default Home;
