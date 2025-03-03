import React, { useContext, useState, useEffect, useRef } from "react";
import MainCard from "../../common/MainCard";
import ChildCard from "../../common/ChildCard";
import StatusChip from "../../common/StatusChip";
import NewCompass from "./NewCompass";
import play from "../../assets/play.svg";
import forward from "../../assets/forward.svg";
import stop from "../../assets/stop.svg";
import ChartsData from "../../common/ChartsData";
import OptionBox from "../../common/OptionBox";
import ChartChip from "../../common/ChartChip";
import NewRollMeter from "./NewRollMeter";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";
import HighchartsGauge from "highcharts/modules/solid-gauge";
import {
  confluenceGaugeOptions,
  lineChartOptions,
  pressureGaugeOptions,
  windGaugeOptions,
} from "../../constant";
import { ThemeContext } from "../../ThemeHandler";
import {
  useWindowWidth,
  sendDeviceCommands,
  getValueForKey,
} from "../../utils";
import Modal from "../Modal";
import { formatDateTime } from "../../Js_parsing";
import { WebSocketContext } from "../../App";
import useWebSocket from "react-use-websocket";
import LeafletMap from "../map/Map";
import LineChartWithDropdown from "./LineChart";
import { useTranslation } from "react-i18next";

HighchartsMore(Highcharts);
HighchartsGauge(Highcharts);

const Home = ({
  handleSubmit,
  errorValues,
  setErrorValues,
  response,
  isLoading,
  openModal,
  setOpenModal,
  handleOpenModal,
  fetchingStart,
  data,
  HandleBrowse,
  fileName,
  HandlePlay,
  HandleForward,
  HandleStop,
  playBtn,
  fwdBtn,
  StopBtn,
}) => {
  const { theme, toggleTheme, phase, isPhase1Starts, isPhase2Starts } =
    useContext(ThemeContext);
  const width = useWindowWidth();
  const getChartSize = () => (width >= 1280 && width <= 1440 ? 200 : 260);
  const getCompassSize = () => (width >= 1280 && width <= 1440 ? true : false);
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
  const { t } = useTranslation();
  const [tempUnit, setTempUnit] = useState("C"); // Default: Celsius
  const [windUnit, setWindUnit] = useState(""); // Default: Knots
  const [heightUnit, setHeightUnit] = useState("m"); // Default: Meters
  const [maxTensionUnit, setMaxTensionUnit] = useState("kg");
  const [currentTensionUnit, setCurrentTensionUnit] = useState("");

  // Extract values
  const airTempC = parseFloat(response?.weather?.air_temp || 0);
  const windSpeedKnots = parseFloat(response?.weather?.wind_speed || 0);
  const ballonetHeight = parseFloat(response?.ballonet?.ballonet_height || 0);
  const maxTensionKg = parseFloat(response?.adams?.max_tension || 0);
  const currentTensionKg = parseFloat(response?.adams?.tension || 0);

  // Precompute converted values
  const airTempF = (airTempC * 9) / 5 + 32;
  const windSpeedMS = windSpeedKnots * 0.514444;
  const ballonetHeightFt = ballonetHeight * 3.28084;
  const maxTensionLbs = maxTensionKg * 2.20462;
  const currentTensionLbs = currentTensionKg * 2.20462;

  const [dataPoints, setDataPoints] = useState({
    "Hull Pressure": [],
    "Barometric Pressure": [],
    "Outside Temperature": [],
    "Ballonet Pressure": [],
    "Ballonet Curtain": [],
  });

  useEffect(() => {
    if (response) {
      setDataPoints((prevData) => {
        const newData = {
          "Hull Pressure": updateData(
            prevData["Hull Pressure"],
            response?.helium?.hel_pressure
          ),
          "Barometric Pressure": updateData(
            prevData["Barometric Pressure"],
            response?.weather?.baro_presssure
          ),
          "Outside Temperature": updateData(
            prevData["Outside Temperature"],
            response?.weather?.air_temp
          ),
          "Ballonet Pressure": updateData(
            prevData["Ballonet Pressure"],
            response?.ballonet?.bal_pressure
          ),
          "Ballonet Curtain": updateData(
            prevData["Ballonet Curtain"],
            response?.ballonet?.ballonet_height
          ),
        };

        console.log("Updated DataPoints:", newData); // ✅ Debug data
        return newData;
      });
    }
  }, [response]);

  // Helper function to maintain only last 10 values
  const updateData = (prevArray, newValue) => {
    if (newValue === undefined || isNaN(parseFloat(newValue))) return prevArray; // Ignore invalid data
    const newArray = [...prevArray, parseFloat(newValue)];
    if (newArray.length > 10) newArray.shift(); // Keep only last 10 points
    return newArray;
  };

  const [isUserAction, setIsUserAction] = useState(false);

  const handleChange = (name, value) => {
    if (!fetchingStart) {
      console.error("fetchingStart is false. State updates ignored.");
      return;
    }

    console.log(`Changing ${name} to ${value}`);
    setIsUserAction(true); // Mark this as a user action

    switch (name) {
      case "fan1":
        setFan1(value);
        break;
      case "fan2":
        setFan2(value);
        break;
      case "light":
        setLight(value);
        break;
      case "primary_blower":
        setPrimaryBlower(value);
        break;
      case "secondary_blower":
        setSecondaryBlower(value);
        break;
      case "strobe_light":
        setStrobeLight(value);
        break;
      case "payload_power":
        setPayloadPower(value);
        break;
      default:
        break;
    }
    setSendData(true); // Set sendData after state update
  };

  const [pressedButtons, setPressedButtons] = useState({
    primary_blower_value: false,
    secondary_blower_value: false,
    strobe_lights_value: false,
    payload_power_value: false,
  });

  useEffect(() => {
    if (sendData) {
      const relayControls = {
        method: "alfa.actuator.settings.set",
        modbus: [
          {
            name: "modbus-relay",
            relay: [
              pressedButtons.primary_blower_value ? 1 : 0,
              pressedButtons.secondary_blower_value ? 1 : 0,
              pressedButtons.strobe_lights_value ? 1 : 0,
              pressedButtons.payload_power_value ? 1 : 0,
            ],
          },
        ],
      };

      console.log("Sending data to WebSocket:", relayControls);
      sendJsonMessage(relayControls);
      setSendData(false);
    }
  }, [sendData, pressedButtons]); // Depend on `pressedButtons` instead of separate states

  useEffect(() => {
    if (lastMessage?.data && !isUserAction) {
      console.log("Raw WebSocket Data Received:", lastMessage.data);

      try {
        const parsedData = JSON.parse(lastMessage.data);
        console.log("Parsed Data:", parsedData);

        // Check if the data contains the actuator state
        if (parsedData.data?.modbus?.["modbus-relay"]?.["4196"]) {
          const relay = parsedData.data.modbus["modbus-relay"]["4196"];
          console.log("Relay Data:", relay);

          // Map backend data to UI state
          const newStates = {
            primary_blower_value: relay.primary_blower_value === "1",
            secondary_blower_value: relay.secondary_blower_value === "1",
            strobe_lights_value: relay.strobe_lights_value === "1",
            payload_power_value: relay.payload_power_value === "1",
          };

          // Update the pressedButtons state
          setPressedButtons((prev) => ({
            ...prev,
            ...newStates,
          }));

          console.log("Updated button states:", newStates);
        }
      } catch (error) {
        console.error("Error parsing WebSocket data:", error);
      }
    }
  }, [lastMessage, isUserAction]);

  useEffect(() => {
    if (isUserAction) {
      const timeout = setTimeout(() => {
        setIsUserAction(false); // Reset after delay
      }, 1000); // Adjust the delay as needed

      return () => clearTimeout(timeout);
    }
  }, [isUserAction]);

  const toggleButton = (key) => {
    setPressedButtons((prev) => {
      const newState = !prev[key];
      const updatedState = { ...prev, [key]: newState };

      // Collect new states and send once
      const newPrimaryBlower = updatedState.primary_blower_value ? "On" : "Off";
      const newSecondaryBlower = updatedState.secondary_blower_value
        ? "On"
        : "Off";
      const newStrobeLight = updatedState.strobe_lights_value ? "On" : "Off";
      const newPayloadPower = updatedState.payload_power_value ? "On" : "Off";

      setPrimaryBlower(newPrimaryBlower);
      setSecondaryBlower(newSecondaryBlower);
      setStrobeLight(newStrobeLight);
      setPayloadPower(newPayloadPower);

      setSendData(true); // Trigger WebSocket update after setting all states

      return updatedState;
    });
  };

  const formatNumber = (num) => {
    if (!num || isNaN(num)) return "N/A"; // Handle invalid values

    const absNum = Math.abs(num); // Work with positive values

    if (absNum >= 1.0e9) {
      return (num / 1.0e9).toFixed(2) + "B"; // Billion
    }
    if (absNum >= 1.0e6) {
      return (num / 1.0e6).toFixed(2) + "M"; // Million
    }
    if (absNum >= 1.0e3) {
      return (num / 1.0e3).toFixed(2) + "K"; // Thousand
    }
    return num.toString(); // Small numbers remain unchanged
  };

  // const [pressedButtons, setPressedButtons] = useState({
  //   primary_blower: false,
  //   secondary_blower: false,
  //   strobe_light: false,
  //   payload_power: false,
  // });

  // const toggleButton = (buttonName) => {
  //   setPressedButtons((prev) => ({
  //     ...prev,
  //     [buttonName]: !prev[buttonName],
  //   }));

  //   handleChange(buttonName, pressedButtons[buttonName] ? "Off" : "On");
  // };

  console.log("Humidity Data:", response?.weather?.humidity);

  const [pressureGaugeOpts, setPressureGaugeOpts] = useState(
    pressureGaugeOptions(theme, 0, 6, [0], getChartSize())
  );

  const [confluenceGaugeOpts, setConfluenceGaugeOpts] = useState(
    confluenceGaugeOptions(theme, 0, 350, [0], getChartSize())
  );

  const [windGaugeOpts, setWindGaugeOpts] = useState(
    windGaugeOptions(theme, 0, 50, [0], getChartSize())
  );

  const [ballonetGaugeOpts, setBallonetGaugeOpts] = useState(
    pressureGaugeOptions(theme, 0, 6, [0], getChartSize())
  );

  const pressureChartRef = useRef(null);
  const confluenceChartRef = useRef(null);
  const windChartRef = useRef(null);
  const ballonetChartRef = useRef(null);

  useEffect(() => {
    if (response) {
      // Function to update the gauge without resetting
      const updateGauge = (chartRef, newValue) => {
        if (chartRef.current && chartRef.current.chart) {
          chartRef.current.chart.series[0].setData([newValue], true);
        }
      };

      // Updating all gauges dynamically
      updateGauge(
        pressureChartRef,
        Math.min(
          6,
          Math.max(0, parseFloat(response?.helium?.hel_pressure) || 0)
        )
      );

      updateGauge(
        confluenceChartRef,
        Math.min(350, Math.max(0, parseFloat(response?.adams?.tension) || 0))
      );

      updateGauge(
        windChartRef,
        Math.min(
          50,
          Math.max(0, parseFloat(response?.weather?.wind_speed) || 0)
        )
      );

      updateGauge(
        ballonetChartRef,
        Math.min(
          6,
          Math.max(0, parseFloat(response?.ballonet?.bal_pressure) || 0)
        )
      );
    }
  }, [response]);

  return (
    <>
      <div className="container">
        <div className="main-content">
          <div className="main">
            <div
              className={`preferences2 ${
                theme === "light" ? "preferences2-light" : "preferences2-dark"
              }`}
            >
              <div className="pref-data-new">
                <ChartChip
                  name={"Temperature:"}
                  value={
                    phase === 1
                      ? "N/A"
                      : response?.digitalCompass.temperature === "NaN" ||
                        !response?.digitalCompass.temperature
                      ? "N/A"
                      : response?.digitalCompass.temperature
                  }
                  unit={"°"}
                />

                <ChartChip
                  name={"Humidity:"}
                  value={
                    phase === 1
                      ? "N/A"
                      : response?.digitalCompass.humidity === "NaN" ||
                        !response?.digitalCompass.humidity
                      ? "N/A"
                      : `${response?.digitalCompass.humidity}%`
                  }
                  unit={""}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  columnGap: "10px",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "20px",
                  }}
                >
                  {t("preferences")}
                </p>
                <div
                  className={`choice ${
                    theme === "light" ? "choice-light" : "choice-dark"
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
              <MainCard title={t("weatherStation")}>
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
                        <StatusChip
                          color={"blue"}
                          description={t("windAngle")}
                        />
                        {/* Section for Phase 1 */}
                        {phase === 1 && (
                          <div className="phase-1-section">
                            <StatusChip
                              color={"red"}
                              description={"Aerostat Heading"}
                            />
                          </div>
                        )}

                        {phase === 2 && (
                          <ChartChip
                            name={t("humidity")}
                            value={response?.weather?.humidity}
                            unit={"%"}
                          />
                        )}

                        {/* <ChartChip
                      name={"Heading"}
                      value={parseFloat(
                        response?.digitalCompass?.mag_heading
                      ).toFixed(2)}
                      unit={"°"}
                    /> */}
                      </div>
                    </div>
                  </ChildCard>
                </div>
              </MainCard>
              <MainCard title={t("windSpeed")}>
                <div className="wind-speed-card">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={windGaugeOpts}
                    ref={windChartRef}
                  />
                  <ChartsData
                    position={"between"}
                    description1={t("airTemp")}
                    value1={
                      <select
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#4260ff",
                          fontWeight: "800",
                          fontSize: "16px",
                        }}
                        value={tempUnit}
                        onChange={(e) => setTempUnit(e.target.value)}
                      >
                        <option value="C">{airTempC.toFixed(2)} °C</option>
                        <option value="F">{airTempF.toFixed(2)} °F</option>
                      </select>
                    }
                    graphName={t("windSpeed")}
                    description2={t("baroPress")}
                    value2={`${parseFloat(
                      response?.weather?.baro_presssure || 0
                    ).toFixed(2)} hPa`}
                    graphValue={
                      <select
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#4260ff",
                          fontWeight: "800",
                          fontSize: "16px",
                        }}
                        value={windUnit}
                        onChange={(e) => setWindUnit(e.target.value)}
                      >
                        <option value="Knots">
                          {windSpeedKnots.toFixed(2)} Knots
                        </option>
                        <option value="m/s">
                          {windSpeedMS.toFixed(2)} m/s
                        </option>
                      </select>
                    }
                  />
                </div>
              </MainCard>
            </div>
            <div className="box2">
              <div
                className={`preferences ${
                  theme === "light" ? "preferences-light" : "preferences-dark"
                }`}
              >
                <div className="pref-data-new">
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: theme === "light" ? "black" : "white",
                    }}
                  >
                    AlfaCOR:
                  </h3>
                  <ChartChip
                    name={t("temperature")}
                    value={
                      phase === 1
                        ? "N/A"
                        : response?.digitalCompass.temperature === "NaN" ||
                          !response?.digitalCompass.temperature
                        ? "N/A"
                        : response?.digitalCompass.temperature
                    }
                    unit={phase === 1 ? "" : "°"}
                  />

                  <ChartChip
                    name={t("humidity")}
                    value={
                      phase === 1
                        ? "N/A"
                        : response?.digitalCompass.humidity === "NaN" ||
                          !response?.digitalCompass.humidity
                        ? "N/A"
                        : `${response?.digitalCompass.humidity}%`
                    }
                    unit={""}
                  />
                  <StatusChip
                    color={"green"}
                    description={
                      fetchingStart
                        ? isLoading
                          ? "Loading..."
                          : t("connected")
                        : t("disconnected")
                    }
                  />
                </div>
                {/* <div className="prefrence-box-new">
                  <p
                    style={{
                      fontSize: "20px",
                      color: theme === "light" ? "black" : "white",
                    }}
                  >
                    {t("preferences")}
                  </p>

                  <div
                    className={`choice ${
                      theme === "light" ? "choice-light" : "choice-dark"
                    }`}
                    onClick={toggleTheme}
                  >
                    {theme === "light" ? (
                      <>
                        <div className="theme-light"></div>
                        <p className="theme-text-light">{t("light")}</p>
                      </>
                    ) : (
                      <>
                        <p className="theme-text-dark">{t("dark")}</p>
                        <div className="theme-dark"></div>
                      </>
                    )}
                  </div>
                </div> */}
              </div>
              <MainCard title={t("aerostatPosition")}>
                <div className="magnetometer-box">
                  <div className="heading-box2">
                    <ChildCard>
                      <div
                        className={
                          phase === 1
                            ? `heading-box-content`
                            : `heading-box-content-phase2`
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            rowGap: "10px",
                          }}
                        >
                          {/* {phase === 2 && (
                        <div className="phase-2-section">
                          <StatusChip color={"red"} description={"Humidity"} />
                          <ChartChip
                            name={"Humidity"}
                            value={getValueForKey("Humidity:", response)}
                          />
                        </div>
                      )} */}
                          {phase === 1 && (
                            <ChartChip
                              name={"Heading"}
                              value={parseFloat(
                                response?.digitalCompass?.mag_heading
                              ).toFixed(2)}
                              unit={"°"}
                            />
                          )}
                          {phase === 2 && (
                            <>
                              <ChartChip
                                name={t("longitude")}
                                value={
                                  response?.weather?.longitude === "NaN" ||
                                  !response?.weather?.longitude
                                    ? "N/A"
                                    : `${response?.weather?.longitude}°`
                                }
                                unit={""}
                              />
                              <ChartChip
                                name={t("latitude")}
                                value={
                                  response?.weather?.latitude === "NaN" ||
                                  !response?.weather?.latitude
                                    ? "N/A"
                                    : `${response?.weather?.latitude}°`
                                }
                                unit={""}
                              />
                              <ChartChip
                                name={t("altitude")}
                                value={
                                  response?.weather?.altitude === "NaN" ||
                                  !response?.weather?.altitude
                                    ? "N/A"
                                    : `${formatNumber(
                                        response.weather.altitude
                                      )}m`
                                }
                                unit={""}
                              />
                            </>
                          )}
                        </div>
                        {/* Show NewCompass only in phase 1 */}
                        {phase === 1 && (
                          <NewCompass
                            size={getCompassSize()}
                            needle1={response?.digitalCompass?.mag_heading}
                          />
                        )}

                        {/* Show LeafletMap only in phase 2 */}
                        {phase === 2 &&
                          response?.weather?.latitude &&
                          response?.weather?.longitude && (
                            <LeafletMap
                              lat={response.weather.latitude}
                              lng={response.weather.longitude}
                            />
                          )}
                      </div>
                    </ChildCard>
                  </div>
                  <div className="heading-box2">
                    <ChildCard>
                      <div
                        className={
                          phase === 1
                            ? `pitch-box-content`
                            : `pitch-box-content-phase2`
                        }
                      >
                        <div className="pitch-roll-chips">
                          {phase === 2 && (
                            <ChartChip
                              name={"Pitch:"}
                              value={parseFloat(
                                response?.digitalCompass?.pitch
                              ).toFixed(2)}
                              unit={"°"}
                            />
                          )}
                          <ChartChip
                            name={t("roll")}
                            value={parseFloat(
                              response?.digitalCompass?.roll
                            ).toFixed(2)}
                            unit={"°"}
                          />

                          {phase === 1 && (
                            <ChartChip
                              name={"Pitch"}
                              value={parseFloat(
                                response?.digitalCompass?.pitch
                              ).toFixed(2)}
                              unit={"°"}
                            />
                          )}

                          {/* <ChartChip
                            name={"Longitude:"}
                            value={
                              response?.weather?.longitude === "NaN" ||
                              !response?.weather?.longitude
                                ? "N/A"
                                : `${response?.weather?.longitude}°`
                            }
                            unit={""}
                          />
                          <ChartChip
                            name={"Latitude:"}
                            value={
                              response?.weather?.latitude === "NaN" ||
                              !response?.weather?.latitude
                                ? "N/A"
                                : `${response?.weather?.latitude}°`
                            }
                            unit={""}
                          /> */}
                          {phase === 2 && (
                            <div className="phase-2-section">
                              {/* <StatusChip color={"red"} description={"Humidity"} /> */}
                              {/* <ChartChip
                              name={"Humidity"}
                              value={getValueForKey("Humidity:", response)}
                            /> */}
                              <ChartChip
                                name={t("heading")}
                                value={parseFloat(
                                  response?.digitalCompass?.mag_heading
                                ).toFixed(2)}
                                unit={"°"}
                              />
                            </div>
                          )}
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
              {/* <div className="horizontal-box1">
                <div className="pressure-box">
                  <MainCard title={t("pressures")}>
                    <div className="pressure-box-content">
                      <div>
                        <HighchartsReact
                          highcharts={Highcharts}
                          options={pressureGaugeOpts}
                        />
                            <ChartChip
                              name={"Heading"}
                              value={parseFloat(
                                response?.digitalCompass?.mag_heading
                              ).toFixed(2)}
                              unit={"°"}
                            />
                          </div>
                        
                      )}
                      
                    </div>
                    />
                    <NewRollMeter
                      roll={response?.digitalCompass?.roll}
                      pitch={response?.digitalCompass?.pitch}
                    />
                  </div>
                </ChildCard>
              </div>
            </div> */}

              <div className="horizontal-box1">
                <div className="pressure-box">
                  <MainCard title={t("pressures")}>
                    <div className="pressure-box-content">
                      <div>
                        <HighchartsReact
                          highcharts={Highcharts}
                          options={pressureGaugeOpts}
                          ref={pressureChartRef}
                        />

                        <ChartsData
                          position={"around"}
                          graphValue={parseFloat(
                            response?.helium?.hel_pressure
                          ).toFixed(2)}
                          graphName={t("hullPressure")}
                        />
                      </div>
                      <div>
                        <HighchartsReact
                          highcharts={Highcharts}
                          options={ballonetGaugeOpts}
                          ref={ballonetChartRef}
                        />

                        <ChartsData
                          position={phase === 1 ? "around" : "between"}
                          graphValue={parseFloat(
                            response?.ballonet?.bal_pressure
                          ).toFixed(2)}
                          graphName={t("ballonetPressure")}
                          description1={phase === 2 && t("curtainHeight")}
                          value1={
                            phase === 2 &&
                            (response?.ballonet?.ballonet_height === "NaN" ||
                              !response?.ballonet?.ballonet_height)
                              ? "N/A"
                              : phase === 2 &&
                                response?.ballonet?.ballonet_height && (
                                  <select
                                    style={{
                                      background: "transparent",
                                      border: "none",
                                      color: "#4260ff",
                                      fontWeight: "800",
                                      fontSize: "16px",
                                    }}
                                    value={heightUnit}
                                    onChange={(e) =>
                                      setHeightUnit(e.target.value)
                                    }
                                  >
                                    <option value="m">
                                      {ballonetHeight.toFixed(2)} m
                                    </option>
                                    <option value="ft">
                                      {ballonetHeightFt.toFixed(2)} ft
                                    </option>
                                  </select>
                                )
                          }
                        />
                      </div>
                    </div>
                  </MainCard>
                </div>
                <div className="confluence-box">
                  <MainCard title={t("lift")}>
                    <div className="confluence-box-content">
                      <ChartChip
                        name={t("maxTension")}
                        value={
                          <select
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#4260ff",
                              fontWeight: "800",
                              fontSize: "16px",
                            }}
                            value={maxTensionUnit}
                            onChange={(e) => setMaxTensionUnit(e.target.value)}
                          >
                            <option value="kg">
                              {maxTensionKg.toFixed(2)} kg
                            </option>
                            <option value="lbs">
                              {maxTensionLbs.toFixed(2)} lbs
                            </option>
                          </select>
                        }
                      />

                      <div className="confluence-graph">
                        <HighchartsReact
                          highcharts={Highcharts}
                          options={confluenceGaugeOpts}
                          ref={confluenceChartRef}
                        />
                        <ChartsData
                          position={"center"}
                          graphName={t("currentTension")}
                          graphValue={
                            <select
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#4260ff",
                                fontWeight: "800",
                                fontSize: "16px",
                              }}
                              value={currentTensionUnit}
                              onChange={(e) =>
                                setCurrentTensionUnit(e.target.value)
                              }
                            >
                              <option value="kg">
                                {currentTensionKg.toFixed(2)} kg
                              </option>
                              <option value="lbs">
                                {currentTensionLbs.toFixed(2)} lbs
                              </option>
                            </select>
                          }
                        />
                      </div>
                    </div>
                  </MainCard>
                </div>
              </div>
            </div>
            {phase === 2 && (
              // <div
              //   style={{
              //     padding: "0px 30px",
              //   }}
              // >

              <div>
                <div className="right-sidebar-content">
                  <div className="right-section-design">
                    <div className="controls-box">
                      {[
                        {
                          key: "primary_blower_value",
                          imgLight: "/src/assets/primary_blower.png",
                          imgDark: "/src/assets/primary_blower-dark.png",
                        },
                        {
                          key: "secondary_blower_value",
                          imgLight: "/src/assets/secondary_blower.png",
                          imgDark: "/src/assets/secondary_blower-dark.png",
                        },
                        {
                          key: "strobe_lights_value",
                          imgLight: "/src/assets/strobe_lights.png",
                          imgDark: "/src/assets/strobe_light-dark.png",
                        },
                        {
                          key: "payload_power_value",
                          imgLight: "/src/assets/payload_power.png",
                          imgDark: "/src/assets/payload_power-dark.png",
                        },
                      ].map(({ key, imgLight, imgDark }) => {
                        console.log(`Rendering ${key}:`, pressedButtons[key]); // Debug log
                        return (
                          <div key={key} className="fan-box">
                            <div
                              className={`button-container ${
                                pressedButtons[key] ? "pressed" : ""
                              }`}
                              onClick={() => toggleButton(key)}
                            >
                              <img
                                src={theme === "light" ? imgLight : imgDark}
                                alt={key}
                                className="button-img"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
