import React, { useContext, useEffect, useRef, useState } from "react";
import Header from "../components/New-Components/Header";
import Home from "../components/New-Components/Home";
import Sidebar from "../components/New-Components/Sidebar";
import { ThemeContext } from "../ThemeHandler";
import { formatDateTime, processData, processDataArray } from "../Js_parsing";
import { fetchDataUtil, updateConfigUtil } from "../utils";
import "./phase1.css";
import { WebSocketContext } from "../App";
import useWebSocket from "react-use-websocket";
import { PHASE_2_DATA } from "./phase2Data";
import RightSidebar from "../components/New-Components/RightSidebar";

const Phase1 = React.memo(() => {
  const { readyState, sendJsonMessage, lastMessage } =
    useContext(WebSocketContext);
  const [activateWebSocket, setActivateWebSocket] = useState(false);

  const connectionStatus = {
    0: "Connecting",
    1: "Connected",
    2: "Closing",
    3: "Closed",
  }[readyState];
  const lastPerfectResponses = useRef({
    adams: {
      max_tension: parseFloat(700).toFixed(2),
      tension: parseFloat(10).toFixed(2),
    },
    ballonet: {
      bal_pressure: parseFloat(0.071).toFixed(2),
      ballonet_height: parseFloat(0).toFixed(2),
    },
    digitalCompass: {
      mag_heading: parseFloat(240.1).toFixed(2),
      pitch: parseFloat(0).toFixed(2),
      roll: parseFloat(0).toFixed(2),
      humidity: parseFloat(0).toFixed(2),
      yaw: parseFloat(0).toFixed(2),
      position_accuracy: parseFloat(0).toFixed(2),
      temperature: parseFloat(0).toFixed(2),
    },
    ebox: {
      InternalTemp: parseFloat(25.5).toFixed(2),
      fan1: "ON",
      fan2: "ON",
      position: "1",
      strobe: "OFF",
    },
    relay: {
      primary_blower: "Off",
      secondary_blower: "Off",
      strobe_lights: "Off",
      payload_power: "OFF",
    },
    helium: { hel_pressure: parseFloat(0.398).toFixed(2) },
    weather: {
      air_temp: parseFloat(18.8).toFixed(2),
      baro_presssure: parseFloat(29.3).toFixed(29.3),
      heading: parseFloat(128).toFixed(2),
      humidity: parseFloat(0).toFixed(2),
      wind_angle: parseFloat(158.4).toFixed(2),
      wind_speed: parseFloat(70).toFixed(2),
      longitude: parseFloat(54.3773).toFixed(2),
      latitude: parseFloat(24.4539).toFixed(2),
      altitude: parseFloat(0).toFixed(2),
      ground_speed: parseFloat(0).toFixed(2),
    },
    port_4002: "Disconnected",
    port_4003: "Disconnected",
    port_4004: "Disconnected",
    port_4005: "Disconnected",
    port_4006: "Disconnected",
    loading: "Disconnected",
  });

  const {
    theme,
    form,
    phase1Start,
    phase2Start,
    setPhase1Start,
    phase,
    setIsPhase1Starts,
    setIsPhase2Starts,
    fileFetchingStart,
    setFileFetchingStart,
  } = useContext(ThemeContext);
  const [sidebar, setSidebar] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const [responses, setResponses] = useState(lastPerfectResponses.current);
  const [openModal, setOpenModal] = useState(false);
  const [startFetchData, setStartFetchData] = useState(true);
  const [startFetchingFromFile, setStartFetchingFromFile] = useState(false);
  const [logFile, setLogFile] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [playBtn, setPlayBtn] = useState(false);
  const [fwdBtn, setFwdBtn] = useState(false);
  const [stopBtn, setStopBtn] = useState(false);
  const [fileData, setfileData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentResult, setCurrentResult] = useState(null);
  const [fetchingSpeed, setFetchingSpeed] = useState(1000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (phase === 2) {
      sendJsonMessage(PHASE_2_DATA);
      sendJsonMessage({
        method: "alfa.braodcast.settings.set",
        enable: true,
      });

      console.log("Phase 2 Data Sent:", PHASE_2_DATA);
    }
  }, [phase]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme") || "light";
    document.documentElement.style.setProperty(
      "--main-bg-color",
      savedTheme === "light"
        ? "var(--main-light-bg-color)"
        : "var(--main-dark-bg-color)"
    );
    setIsThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (isThemeLoaded) {
      document.documentElement.style.setProperty(
        "--main-bg-color",
        theme === "light"
          ? "var(--main-light-bg-color)"
          : "var(--main-dark-bg-color)"
      );
    }
  }, [theme, isThemeLoaded]);

  const isInvalidValue = (value) => {
    return (
      value === undefined || value === "none" || value === null || isNaN(value)
    );
  };

  const fetchData = (message) => {
    try {
      const data = JSON.parse(message.data);
      console.log(data, "RECEIVING DATA");
      if (data) {
        const parsedResponses = {
          weather: {
            air_temp: isInvalidValue(
              phase === 1
                ? data?.data?.tcp?.tcp1["4002"]?.air_temperature
                : data?.data?.modbus?.modbus1[5007]?.air_temperature
            )
              ? lastPerfectResponses.current.weather.air_temp
              : parseFloat(
                  phase === 1
                    ? data?.data?.tcp?.tcp1["4002"]?.air_temperature
                    : data?.data?.modbus?.modbus1[5007]?.air_temperature
                ).toFixed(2),
            baro_presssure: isInvalidValue(
              phase === 1
                ? data?.data?.tcp?.tcp1["4002"]?.barometric_pressure
                : data?.data?.modbus?.modbus1[5007]?.barometric_pressure
            )
              ? lastPerfectResponses.current.weather.baro_presssure
              : parseFloat(
                  phase === 1
                    ? data?.data?.tcp?.tcp1["4002"]?.barometric_pressure
                    : data?.data?.modbus?.modbus1[5007]?.barometric_pressure
                ).toFixed(2),
            heading: isInvalidValue(
              phase === 1
                ? data?.data?.tcp?.tcp1["4002"]?.heading
                : data?.data?.modbus?.modbus1[5007]?.humidity
            )
              ? lastPerfectResponses.current.weather.heading
              : parseFloat(
                  phase === 1
                    ? data?.data?.tcp?.tcp1["4002"]?.heading
                    : data?.data?.modbus?.modbus1[5007]?.humidity
                ).toFixed(2),
            humidity: isInvalidValue(
              data?.data?.modbus?.modbus1[5007]?.humidity
            )
              ? lastPerfectResponses.current.weather.humidity
              : parseFloat(data?.data?.modbus?.modbus1[5007]?.humidity).toFixed(
                  2
                ),

            wind_angle: isInvalidValue(
              phase === 1
                ? data?.data?.tcp?.tcp1["4002"]?.wind_angle
                : data?.data?.modbus?.modbus1[5007]?.wind_angle
            )
              ? lastPerfectResponses.current.weather.wind_angle
              : parseFloat(
                  phase === 1
                    ? data?.data?.tcp?.tcp1["4002"]?.wind_angle
                    : data?.data?.modbus?.modbus1[5007]?.wind_angle
                ).toFixed(2),
            wind_speed: isInvalidValue(
              phase === 1
                ? data?.data?.tcp?.tcp1["4002"]?.wind_speed
                : data?.data?.modbus?.modbus1[5007]?.wind_speed
            )
              ? lastPerfectResponses.current.weather.wind_speed
              : parseFloat(
                  phase === 1
                    ? data?.data?.tcp?.tcp1["4002"]?.wind_speed
                    : data?.data?.modbus?.modbus1[5007]?.wind_speed
                ).toFixed(2),
            longitude: isInvalidValue(
              phase === 2 && data?.data?.modbus?.modbus1[5003]?.longitude
            )
              ? lastPerfectResponses.current.weather.longitude
              : parseFloat(
                  phase === 2 && data?.data?.modbus?.modbus1[5003]?.longitude
                ).toFixed(2),
            latitude: isInvalidValue(
              phase === 2 && data?.data?.modbus?.modbus1[5003]?.latitude
            )
              ? lastPerfectResponses.current.weather.latitude
              : parseFloat(
                  phase === 2 && data?.data?.modbus?.modbus1[5003]?.latitude
                ).toFixed(2),
            altitude: isInvalidValue(
              phase === 2 && data?.data?.modbus?.modbus1[5003]?.altitude
            )
              ? lastPerfectResponses.current.weather.altitude
              : parseFloat(
                  phase === 2 && data?.data?.modbus?.modbus1[5003]?.altitude
                ).toFixed(2),
            ground_speed: isInvalidValue(
              phase === 2 && data?.data?.modbus?.modbus1[5003]?.ground_speed
            )
              ? lastPerfectResponses.current.weather.ground_speed
              : parseFloat(
                  phase === 2 && data?.data?.modbus?.modbus1[5003]?.ground_speed
                ).toFixed(2),
          },
          digitalCompass: {
            mag_heading: isInvalidValue(
              phase === 1
                ? data?.data?.tcp?.tcp1[4003]?.magnitude_heading
                : data?.data?.modbus?.modbus1[5003]?.heading
            )
              ? lastPerfectResponses.current.digitalCompass.mag_heading
              : parseFloat(
                  phase === 1
                    ? data?.data?.tcp?.tcp1[4003]?.magnitude_heading
                    : data?.data?.modbus?.modbus1[5003]?.heading
                ).toFixed(2),
            pitch: isInvalidValue(
              phase === 1
                ? data?.data?.tcp?.tcp1[4003]?.pitch
                : data?.data?.modbus?.modbus1[5003]?.pitch
            )
              ? lastPerfectResponses.current.digitalCompass.pitch
              : parseFloat(
                  phase === 1
                    ? data?.data?.tcp?.tcp1[4003]?.pitch
                    : data?.data?.modbus?.modbus1[5003]?.pitch
                ).toFixed(2),
            roll: isInvalidValue(
              phase === 1
                ? data?.data?.tcp?.tcp1[4003]?.roll
                : data?.data?.modbus?.modbus1[5003]?.roll
            )
              ? lastPerfectResponses.current.digitalCompass.roll
              : parseFloat(
                  phase === 1
                    ? data?.data?.tcp?.tcp1[4003]?.roll
                    : data?.data?.modbus?.modbus1[5003]?.roll
                ).toFixed(2),
            humidity: isInvalidValue(
              phase === 2 && data?.data?.modbus?.modbus1[5006]?.humidity
            )
              ? lastPerfectResponses.current.digitalCompass.humidity
              : parseFloat(
                  phase === 2 && data?.data?.modbus?.modbus1[5006]?.humidity
                ).toFixed(2),
            temperature: isInvalidValue(
              phase === 2 && data?.data?.modbus?.modbus1[5006]?.temperature
            )
              ? lastPerfectResponses.current.digitalCompass.temperature
              : parseFloat(
                  phase === 2 && data?.data?.modbus?.modbus1[5006]?.temperature
                ).toFixed(2),
            yaw: isInvalidValue(
              phase === 2 && data?.data?.modbus?.modbus1[5003]?.yaw
            )
              ? lastPerfectResponses.current.digitalCompass.yaw
              : parseFloat(
                  phase === 2 && data?.data?.modbus?.modbus1[5003]?.yaw
                ).toFixed(2),
            position_accuracy: isInvalidValue(
              phase === 2 &&
                data?.data?.modbus?.modbus1[5003]?.position_accuracy
            )
              ? lastPerfectResponses.current.digitalCompass.position_accuracy
              : parseFloat(
                  phase === 2 &&
                    data?.data?.modbus?.modbus1[5003]?.position_accuracy
                ).toFixed(2),
          },
          ballonet: {
            bal_pressure: isInvalidValue(
              phase === 1
                ? data?.data?.tcp?.tcp1[4004]?.bal_pressure
                : data?.data?.modbus?.modbus1[5002]?.bal_pressure
            )
              ? lastPerfectResponses.current.ballonet.bal_pressure
              : parseFloat(
                  phase === 1
                    ? data?.data?.tcp?.tcp1[4004]?.bal_pressure
                    : data?.data?.modbus?.modbus1[5002]?.bal_pressure
                ).toFixed(2),
            ballonet_height: isInvalidValue(
              phase === 2 && data?.data?.modbus?.modbus1[5004]?.ballonet_height
            )
              ? lastPerfectResponses.current.ballonet.ballonet_height
              : parseFloat(
                  phase === 2 &&
                    data?.data?.modbus?.modbus1[5004]?.ballonet_height
                ).toFixed(2),
          },
          helium: {
            hel_pressure: isInvalidValue(
              phase === 1
                ? data?.data?.tcp?.tcp1[4005]?.hellium_pressure
                : data?.data?.modbus?.modbus1[5001]?.hull_pressure
            )
              ? lastPerfectResponses.current.helium.hel_pressure
              : parseFloat(
                  phase === 1
                    ? data?.data?.tcp?.tcp1[4005]?.hellium_pressure
                    : data?.data?.modbus?.modbus1[5001]?.hull_pressure
                ).toFixed(2),
          },
          adams: {
            max_tension: isInvalidValue(
              phase === 1
                ? data?.data?.tcp?.tcp1[4006]?.max_tension
                : data?.data?.modbus?.modbus1[5005]?.max_tension
            )
              ? lastPerfectResponses.current.adams.max_tension
              : parseFloat(
                  phase === 1
                    ? data?.data?.tcp?.tcp1[4006]?.max_tension
                    : data?.data?.modbus?.modbus1[5005]?.max_tension
                ).toFixed(2),
            tension: isInvalidValue(
              phase === 1
                ? data?.data?.tcp?.tcp1[4006]?.tension
                : data?.data?.modbus?.modbus1[5005]?.tension
            )
              ? lastPerfectResponses.current.adams.tension
              : parseFloat(
                  phase === 1
                    ? data?.data?.tcp?.tcp1[4006]?.tension
                    : data?.data?.modbus?.modbus1[5005]?.tension
                ).toFixed(2),
          },
          relay: {
            primary_blower:
              phase === 2
                ? data?.data?.modbus?.modbus1[4196]?.primary_blower_value ===
                  "0"
                  ? "Off"
                  : data?.data?.modbus?.modbus1[4196]?.primary_blower_value ===
                    "1"
                  ? "On"
                  : "Off"
                : "Off",
            secondary_blower:
              phase === 2
                ? data?.data?.modbus?.modbus1[4196]?.secondary_blower_value ===
                  "0"
                  ? "Off"
                  : data?.data?.modbus?.modbus1[4196]
                      ?.secondary_blower_value === "1"
                  ? "On"
                  : "Off"
                : "Off",
            payload_power:
              phase === 2
                ? data?.data?.modbus?.modbus1[4196]?.payload_power_value === "0"
                  ? "Off"
                  : data?.data?.modbus?.modbus1[4196]?.payload_power_value ===
                    "1"
                  ? "On"
                  : "Off"
                : "Off",
            strobe_lights:
              phase === 2
                ? data?.data?.modbus?.modbus1[4196]?.strobe_lights_value === "0"
                  ? "Off"
                  : data?.data?.modbus?.modbus1[4196]?.strobe_lights_value ===
                    "1"
                  ? "On"
                  : "Off"
                : "Off",
          },
          time: formatDateTime(),
          loading:
            data?.status === "connected" || "success"
              ? "Connected"
              : "Disconnected",
          port_4002: data?.data?.tcp?.tcp1[4002]?.connection_status
            ? data?.data?.tcp?.tcp1[4002]?.connection_status
            : "Disconnected",
          port_4003: data?.data?.tcp?.tcp1[4003]?.connection_status
            ? data?.data?.tcp?.tcp1[4003]?.connection_status
            : "Disconnected",
          port_4004: data?.data?.tcp?.tcp1[4004]?.connection_status
            ? data?.data?.tcp?.tcp1[4004]?.connection_status
            : "Disconnected",
          port_4005: data?.data?.tcp?.tcp1[4005]?.connection_status
            ? data?.data?.tcp?.tcp1[4005]?.connection_status
            : "Disconnected",
          port_4006: data?.data?.tcp?.tcp1[4006]?.connection_status
            ? data?.data?.tcp?.tcp1[4006]?.connection_status
            : "Disconnected",
        };

        lastPerfectResponses.current = {
          ...lastPerfectResponses.current,
          weather: parsedResponses.weather,
          digitalCompass: parsedResponses.digitalCompass,
          ballonet: parsedResponses.ballonet,
          helium: parsedResponses.helium,
          adams: parsedResponses.adams,
        };

        setResponses(parsedResponses);
      } else {
        console.log("IN ELSE");
        setResponses({
          ...lastPerfectResponses.current,
          time: formatDateTime(),
          port_4002: "Disconnected",
          port_4003: "Disconnected",
          port_4004: "Disconnected",
          port_4005: "Disconnected",
          port_4006: "Disconnected",
          loading: "Disconnected",
        });
      }
    } catch (error) {
      console.error("Error parsing WebSocket data:", error);
      console.log("IN CATCH", error);
    }
  };

  useEffect(() => {
    console.log("LOADING:::", loading);
  }, [loading]);

  useEffect(() => {
    console.log("Effect triggered:", {
      startFetchingFromFile,
      startFetchData,
      phase1Start,
      phase2Start,
    });
    if (
      !startFetchingFromFile &&
      (startFetchData || phase1Start || phase2Start)
    ) {
      setActivateWebSocket(true);
    } else {
      setActivateWebSocket(false);
    }
  }, [startFetchingFromFile, startFetchData, phase1Start, phase2Start]);

  useEffect(() => {
    if (activateWebSocket) {
      console.log("WebSocket is active, waiting for data...");
    }
  }, [activateWebSocket]);

  useEffect(() => {
    if (lastMessage && activateWebSocket) {
      fetchData(lastMessage);
    }
  }, [lastMessage]);

  const [errorValues, setErrorValues] = useState([]);

  const handleSubmit = async () => {
    const errors = [];
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;

    Object.keys(form).forEach((key) => {
      if (form[key].trim() === "") {
        errors.push(key);
      }
    });

    if (form.rawtcp_host_ip && !ipRegex.test(form.rawtcp_host_ip.trim())) {
      errors.push("rawtcp_host_ip");
    }

    setErrorValues(errors);
    if (errors.length > 0) {
      return;
    }
    let newForm = {};
    if (phase === 1) {
      newForm = {
        method: "alfa.server.connection.settings.set",
        servers: [
          {
            tcp: [
              {
                name: "tcp1",
                ip: form?.rawtcp_host_ip,
                ports: [
                  {
                    port: form?.weather,
                    name: "weather_station",
                  },
                  {
                    port: form?.hmr,
                    name: "digital_compass",
                  },
                  {
                    port: form?.ballonet,
                    name: "ballonet_pressure",
                  },
                  {
                    port: form?.helium,
                    name: "hellium_pressure",
                  },
                  {
                    port: form?.adam,
                    name: "adam_sensor",
                  },
                ],
              },
            ],
          },
        ],
      };
    }
    if (phase === 2) {
      newForm = {
        method: "alfa.server.connection.settings.set",
        servers: [
          {
            modbus: [
              {
                name: "modbus1",
                ip: form?.modbustcp_host_ip,
                ports: [
                  {
                    port: "5001",
                    name: "hull_pressure",
                  },
                  {
                    port: "5002",
                    name: "ballonet_pressure",
                  },
                  {
                    port: "5003",
                    name: "ahrs",
                  },
                  {
                    port: "5004",
                    name: "ultrasonic",
                  },
                  {
                    port: "5005",
                    name: "load_cell",
                  },
                  {
                    port: "5006",
                    name: "temp_humidity",
                  },
                  {
                    port: "5007",
                    name: "weather_station",
                  },
                ],
              },
              {
                name: "modbus-relay",
                ip: form?.relayIp,
                ports: [
                  {
                    port: form?.relayPort,
                    name: "relay",
                  },
                ],
              },
            ],
          },
        ],
      };
    }
    try {
      setStartFetchData(true);
      setPhase1Start(true);
      setOpenModal(false);
      setStartFetchingFromFile(false);
      setFileFetchingStart(false);
      setErrorValues([]);
      sendJsonMessage(newForm);
      sendJsonMessage({
        method: "alfa.braodcast.settings.set",
        enable: true,
      });
      console.log("Form successfully posted:", newForm);
      if (phase === 1) {
        setIsPhase1Starts(true);
      }
      if (phase === 2) {
        setIsPhase2Starts(true);
      }
    } catch (error) {
      console.log("In catch", error);
      console.log(newForm);
      setOpenModal(false);
      setErrorValues([]);
    }
  };

  const handleOpenModal = () => {
    if (!startFetchingFromFile) {
      setOpenModal(true);
    }
  };

  const handleBrowse = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogFile(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target.result);
        setfileData(null);
        setCurrentIndex(0);
        setCurrentResult(null);
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    if (fileContent) {
      setPlayBtn(true);
      let res = processData(fileContent);
      setfileData(res);
    }
  }, [fileContent]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (startFetchingFromFile && currentIndex < fileData.length) {
        const result = processDataArray(
          [fileData[currentIndex]],
          currentResult
        );
        console.log(result);
        setCurrentResult(result);
        setResponses(result);

        setCurrentIndex((prevIndex) => prevIndex + 1);
      } else if (currentIndex >= fileData?.length) {
        clearInterval(intervalId);

        setStartFetchingFromFile(false);
        setFileFetchingStart(false);
        setFwdBtn(false);
        setPlayBtn(false);
        setFileContent("");
        setLogFile("");
        setCurrentIndex(0);
        setfileData(null);
        setCurrentResult(null);
        setStopBtn(false);
        setFetchingSpeed(1000);
        setStartFetchData(false);
        setPhase1Start(false);

        const fileInput = document.getElementById("fileInput");
        if (fileInput) fileInput.value = "";

        const newResponse = {
          adams: { max_tension: 700, tension: 10 },
          ballonet: { bal_pressure: 0.071 },
          digitalCompass: { mag_heading: 240.1, pitch: 0, roll: 0 },
          ebox: {
            InternalTemp: 25.5,
            fan1: "ON",
            fan2: "ON",
            position: "1",
            strobe: "OFF",
          },
          helium: { hel_pressure: 0.398 },
          weather: {
            air_temp: 18.8,
            baro_presssure: 29.3,
            heading: 128,
            wind_angle: 158.4,
            wind_speed: 70,
          },
          time: formatDateTime(),
        };

        setResponses(newResponse);
      } else {
        clearInterval(intervalId);
      }
    }, fetchingSpeed);

    return () => clearInterval(intervalId);
  }, [
    fileData,
    currentIndex,
    currentResult,
    startFetchingFromFile,
    fetchingSpeed,
  ]);

  const HandlePlay = () => {
    setStartFetchingFromFile(true);
    setFileFetchingStart(true);
    setFwdBtn(true);
    setStopBtn(true);
    setStartFetchData(false);
    setPhase1Start(false);
    setPlayBtn(false);
  };
  const HandleForward = () => {
    if (fetchingSpeed > 125) {
      setFetchingSpeed(fetchingSpeed * 0.5);
    }
  };
  const HandleStop = () => {
    setStartFetchingFromFile(false);
    setFileFetchingStart(false);
    setFwdBtn(false);
    setPlayBtn(false);
    setFileContent("");
    setLogFile("");
    setCurrentIndex(0);
    setfileData(null);
    setCurrentResult(null);
    setStopBtn(false);
    setFetchingSpeed(1000);
    setStartFetchData(false);
    setPhase1Start(false);

    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = "";

    let tempRes = {
      adams: { max_tension: 700, tension: 10 },
      ballonet: { bal_pressure: 0.071 },
      digitalCompass: { mag_heading: 240.1, pitch: 0, roll: 0 },
      ebox: {
        InternalTemp: 25.5,
        fan1: "ON",
        fan2: "ON",
        position: "1",
        strobe: "OFF",
      },
      helium: { hel_pressure: 0.398 },
      weather: {
        air_temp: 18.8,
        baro_presssure: 29.3,
        heading: 128,
        wind_angle: 158.4,
        wind_speed: 70,
      },
      time: formatDateTime(),
    };

    setResponses(tempRes);
  };

  useEffect(() => {
    if (fetchingSpeed == 125) {
      setFwdBtn(false);
    }
  }, [fetchingSpeed]);

  if (!isThemeLoaded) {
    return null;
  }
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", rowGap: "0px" }}>
        <Header
          handleSidebarOpen={() => setSidebar(true)}
          handleRightSidebarOpen={() => setIsSidebarOpen(true)}
          time={responses?.time}
          fileFetching={startFetchingFromFile}
        />
        <Sidebar
          open={sidebar}
          onClose={() => setSidebar(false)}
          handleOpenModal={handleOpenModal}
          playBtn={playBtn}
          fwdBtn={fwdBtn}
          StopBtn={stopBtn}
          response={responses}
        />
        {/* <RightSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          phase={1}
          theme="light"
          fetchingStart={
            (startFetchData || phase1Start || phase2Start) && activateWebSocket
          }
        /> */}

        <Home
          response={responses}
          isLoading={responses?.loading === "Loading"} // Fix here
          handleSubmit={handleSubmit}
          errorValues={errorValues}
          setErrorValues={setErrorValues}
          openModal={openModal}
          setOpenModal={setOpenModal}
          handleOpenModal={handleOpenModal}
          fetchingStart={
            (startFetchData || phase1Start || phase2Start) && activateWebSocket
          }
          HandleBrowse={handleBrowse}
          fileName={logFile}
          HandleForward={HandleForward}
          HandlePlay={HandlePlay}
          HandleStop={HandleStop}
          playBtn={playBtn}
          fwdBtn={fwdBtn}
          StopBtn={stopBtn}
        />
      </div>
      <div
        className={`watermark ${
          theme === "light" ? "watermark-light" : "watermark-dark"
        }`}
      ></div>
    </>
  );
});

export default Phase1;
