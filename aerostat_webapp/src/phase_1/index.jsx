import { useContext, useEffect, useRef, useState } from "react";
import Header from "../components/New-Components/Header";
import Home from "../components/New-Components/Home";
import Sidebar from "../components/New-Components/Sidebar";
import { ThemeContext } from "../ThemeHandler";
import { formatDateTime, processData, processDataArray } from "../Js_parsing";
import { fetchDataUtil, updateConfigUtil } from "../utils";
import "./phase1.css";

function Phase1() {
  const lastPerfectResponses = useRef({
    adams: {
      max_tension: parseFloat(700).toFixed(2),
      tension: parseFloat(10).toFixed(2),
    },
    ballonet: { bal_pressure: parseFloat(0.071).toFixed(2) },
    digitalCompass: {
      mag_heading: parseFloat(240.1).toFixed(2),
      pitch: parseFloat(0).toFixed(2),
      roll: parseFloat(0).toFixed(2),
    },
    ebox: {
      InternalTemp: parseFloat(25.5).toFixed(2),
      fan1: "ON",
      fan2: "ON",
      position: "1",
      strobe: "OFF",
    },
    helium: { hel_pressure: parseFloat(0.398).toFixed(2) },
    weather: {
      air_temp: parseFloat(18.8).toFixed(2),
      baro_presssure: parseFloat(29.3).toFixed(29.3),
      heading: parseFloat(128).toFixed(2),
      wind_angle: parseFloat(158.4).toFixed(2),
      wind_speed: parseFloat(70).toFixed(2),
    },
    port_4002: "Disconnected",
    port_4003: "Disconnected",
    port_4004: "Disconnected",
    port_4005: "Disconnected",
    port_4006: "Disconnected",
  });

  const { theme, form, phase1Start, setPhase1Start } = useContext(ThemeContext);
  const [sidebar, setSidebar] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const [responses, setResponses] = useState(lastPerfectResponses.current);
  const [openModal, setOpenModal] = useState(false);
  const [startFetchData, setStartFetchData] = useState(false);
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
      value === undefined ||
      value === "none" ||
      value === null ||
      (typeof value === "string" && value.trim() === "") ||
      isNaN(value)
    );
  };

  const fetchData = async () => {
    const data = await fetchDataUtil();
    console.log(data)

    if (data) {
      const parsedResponses = {
        weather: {
          air_temp: isInvalidValue(data?.port_data?.port_4002?.air_temp)
            ? lastPerfectResponses.current.weather.air_temp
            : parseFloat(data.port_data.port_4002.air_temp).toFixed(2),
          baro_presssure: isInvalidValue(data?.port_data?.port_4002?.baro_presssure)
            ? lastPerfectResponses.current.weather.baro_presssure
            : parseFloat(data.port_data.port_4002.baro_presssure).toFixed(2),
          heading: isInvalidValue(data?.port_data?.port_4002?.heading)
            ? lastPerfectResponses.current.weather.heading
            : parseFloat(data.port_data.port_4002.heading).toFixed(2),
          wind_angle: isInvalidValue(data?.port_data?.port_4002?.wind_angle)
            ? lastPerfectResponses.current.weather.wind_angle
            : parseFloat(data.port_data.port_4002.wind_angle).toFixed(2),
          wind_speed: isInvalidValue(data?.port_data?.port_4002?.wind_speed)
            ? lastPerfectResponses.current.weather.wind_speed
            : parseFloat(data.port_data.port_4002.wind_speed).toFixed(2),
        },
        digitalCompass: {
          mag_heading: isInvalidValue(data?.port_data?.port_4003?.mag_heading)
            ? lastPerfectResponses.current.digitalCompass.mag_heading
            : parseFloat(data.port_data.port_4003.mag_heading).toFixed(2),
          pitch: isInvalidValue(data?.port_data?.port_4003?.pitch)
            ? lastPerfectResponses.current.digitalCompass.pitch
            : parseFloat(data.port_data.port_4003.pitch).toFixed(2),
          roll: isInvalidValue(data?.port_data?.port_4003?.roll)
            ? lastPerfectResponses.current.digitalCompass.roll
            : parseFloat(data.port_data.port_4003.roll).toFixed(2),
        },
        ballonet: {
          bal_pressure: isInvalidValue(data?.port_data?.port_4004?.bal_pressure)
            ? lastPerfectResponses.current.ballonet.bal_pressure
            : parseFloat(data.port_data.port_4004.bal_pressure).toFixed(2),
        },
        helium: {
          hel_pressure: isInvalidValue(data?.port_data?.port_4005?.hel_pressure)
            ? lastPerfectResponses.current.helium.hel_pressure
            : parseFloat(data.port_data.port_4005.hel_pressure).toFixed(2),
        },
        adams: {
          max_tension: isInvalidValue(data?.port_data?.port_4006?.max_tension)
            ? lastPerfectResponses.current.adams.max_tension
            : parseFloat(data.port_data.port_4006.max_tension).toFixed(2),
          tension: isInvalidValue(data?.port_data?.port_4006?.tension)
            ? lastPerfectResponses.current.adams.tension
            : parseFloat(data.port_data.port_4006.tension).toFixed(2),
        },
        time: formatDateTime(),
        loading: data?.connection_status,
        port_4002: data?.port_data?.port_4002?.connectionstatus
          ? data?.port_data?.port_4002?.connectionstatus
          : "Disconnected",
        port_4003: data?.port_data?.port_4003?.connectionstatus
          ? data?.port_data?.port_4003?.connectionstatus
          : "Disconnected",
        port_4004: data?.port_data?.port_4004?.connectionstatus
          ? data?.port_data?.port_4004?.connectionstatus
          : "Disconnected",
        port_4005: data?.port_data?.port_4005?.connectionstatus
          ? data?.port_data?.port_4005?.connectionstatus
          : "Disconnected",
        port_4006: data?.port_data?.port_4006?.connectionstatus
          ? data?.port_data?.port_4006?.connectionstatus
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
  };

  useEffect(() => {
    if (!startFetchingFromFile && (startFetchData || phase1Start)) {
      const interval = setInterval(fetchData, 1500);
      return () => clearInterval(interval);
    }
  }, [startFetchingFromFile, startFetchData, phase1Start]);

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

    const newForm = {
      rawtcp_host_ip: form?.rawtcp_host_ip,
      weather: Number(form?.weather),
      hmr: Number(form?.hmr),
      ballonet: Number(form?.ballonet),
      helium: Number(form?.helium),
      adam: Number(form?.adam),
      ebox: Number(form?.ebox),
      modbustcp_host_ip: form?.modbustcp_host_ip,
    };
    try {
      setStartFetchData(true);
      setPhase1Start(true)
      setOpenModal(false);
      setStartFetchingFromFile(false);
      setErrorValues([]);
      const result = await updateConfigUtil(newForm);
      if (!result) {
        setStartFetchingFromFile(false);
        setStartFetchData(false);
        setPhase1Start(false)
      }
      console.log("Form successfully posted:", result);
    } catch (error) {
      console.log("In catch");
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
        setCurrentResult(result);
        setResponses(result);

        setCurrentIndex((prevIndex) => prevIndex + 1);
      } else if (currentIndex >= fileData?.length) {
        clearInterval(intervalId);

        setStartFetchingFromFile(false);
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
        setPhase1Start(false)

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
    setFwdBtn(true);
    setStopBtn(true);
    setStartFetchData(false);
    setPhase1Start(false)
    setPlayBtn(false);
  };
  const HandleForward = () => {
    if (fetchingSpeed > 125) {
      setFetchingSpeed(fetchingSpeed * 0.5);
    }
  };
  const HandleStop = () => {
    setStartFetchingFromFile(false);
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
    setPhase1Start(false)

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
        />
        <Home
          response={responses}
          isLoading={responses?.loading}
          handleSubmit={handleSubmit}
          errorValues={errorValues}
          setErrorValues={setErrorValues}
          openModal={openModal}
          setOpenModal={setOpenModal}
          handleOpenModal={handleOpenModal}
          fetchingStart={startFetchData || phase1Start}
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
        className={`watermark ${theme === "light" ? "watermark-light" : "watermark-dark"
          }`}
      ></div>
    </>
  );
}

export default Phase1;
