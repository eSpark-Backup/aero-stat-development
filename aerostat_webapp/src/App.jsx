import './App.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Header from './components/New-Components/Header';
import Home from './components/New-Components/Home';
import Sidebar from './components/New-Components/Sidebar';
import { ThemeContext } from './ThemeHandler';
import { fetchDataUtil, updateConfigUtil } from './utils';
import { formatDateTime, processData, processDataArray } from './Js_parsing';
import { time } from 'highcharts';

function App() {

  const lastPerfectResponses = useRef({
    adams: { MaxTension: parseFloat(700).toFixed(2), Tension: parseFloat(10).toFixed(2) },
    ballonet: { BalPressure: parseFloat(0.071).toFixed(2) },
    digitalCompass: { Magheading: parseFloat(240.1).toFixed(2), Pitch: parseFloat(0).toFixed(2), Roll: parseFloat(0).toFixed(2) },
    ebox: { InternalTemp: parseFloat(25.5).toFixed(2), fan1: 'ON', fan2: 'ON', position: '1', strobe: 'OFF' },
    helium: { HelPressure: parseFloat(0.398).toFixed(2) },
    weather: { airTemp: parseFloat(18.8).toFixed(2), baroPres: parseFloat(29.3).toFixed(29.3), heading: parseFloat(128).toFixed(2), windAngle: parseFloat(158.4).toFixed(2), windSpeed: parseFloat(70).toFixed(2) },
    port_4002: "Disconnected",
    port_4003: "Disconnected",
    port_4004: "Disconnected",
    port_4005: "Disconnected",
    port_4006: "Disconnected",
  });

  const { theme } = useContext(ThemeContext);
  const [sidebar, setSidebar] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const [responses, setResponses] = useState(lastPerfectResponses.current);
  const [isLoading, setIsLoading] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [startFetchData, setStartFetchData] = useState(false);
  const [startFetchingFromFile, setStartFetchingFromFile] = useState(false);
  const [logFile, setLogFile] = useState("");
  const [fileContent, setFileContent] = useState('');
  const [playBtn, setPlayBtn] = useState(false);
  const [fwdBtn, setFwdBtn] = useState(false);
  const [stopBtn, setStopBtn] = useState(false);
  const [fileData, setfileData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentResult, setCurrentResult] = useState(null);
  const [fetchingSpeed, setFetchingSpeed] = useState(1000);



  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme') || 'light';
    document.documentElement.style.setProperty('--main-bg-color',
      savedTheme === 'light' ? 'var(--main-light-bg-color)' : 'var(--main-dark-bg-color)'
    );
    setIsThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (isThemeLoaded) {
      document.documentElement.style.setProperty('--main-bg-color',
        theme === 'light' ? 'var(--main-light-bg-color)' : 'var(--main-dark-bg-color)'
      );
    }
  }, [theme, isThemeLoaded]);

  const isInvalidValue = (value) => {
    return (
      value === undefined ||
      value === "none" ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      isNaN(value)
    );
  };

  const fetchData = async () => {
    const data = await fetchDataUtil();

    if (data) {
      const parsedResponses = {
        weather: {
          airTemp: isInvalidValue(data?.port_data?.port_4002?.airTemp)
            ? lastPerfectResponses.current.weather.airTemp
            : parseFloat(data.port_data.port_4002.airTemp).toFixed(2),
          baroPres: isInvalidValue(data?.port_data?.port_4002?.baroPres)
            ? lastPerfectResponses.current.weather.baroPres
            : parseFloat(data.port_data.port_4002.baroPres).toFixed(2),
          heading: isInvalidValue(data?.port_data?.port_4002?.heading)
            ? lastPerfectResponses.current.weather.heading
            : parseFloat(data.port_data.port_4002.heading).toFixed(2),
          windAngle: isInvalidValue(data?.port_data?.port_4002?.windAngle)
            ? lastPerfectResponses.current.weather.windAngle
            : parseFloat(data.port_data.port_4002.windAngle).toFixed(2),
          windSpeed: isInvalidValue(data?.port_data?.port_4002?.windSpeed)
            ? lastPerfectResponses.current.weather.windSpeed
            : parseFloat(data.port_data.port_4002.windSpeed).toFixed(2),
        },
        digitalCompass: {
          Magheading: isInvalidValue(data?.port_data?.port_4003?.Magheading)
            ? lastPerfectResponses.current.digitalCompass.Magheading
            : parseFloat(data.port_data.port_4003.Magheading).toFixed(2),
          Pitch: isInvalidValue(data?.port_data?.port_4003?.Pitch)
            ? lastPerfectResponses.current.digitalCompass.Pitch
            : parseFloat(data.port_data.port_4003.Pitch).toFixed(2),
          Roll: isInvalidValue(data?.port_data?.port_4003?.Roll)
            ? lastPerfectResponses.current.digitalCompass.Roll
            : parseFloat(data.port_data.port_4003.Roll).toFixed(2),
        },
        ballonet: {
          BalPressure: isInvalidValue(data?.port_data?.port_4004?.BalPressure)
            ? lastPerfectResponses.current.ballonet.BalPressure
            : parseFloat(data.port_data.port_4004.BalPressure).toFixed(2),
        },
        helium: {
          HelPressure: isInvalidValue(data?.port_data?.port_4005?.HelPressure)
            ? lastPerfectResponses.current.helium.HelPressure
            : parseFloat(data.port_data.port_4005.HelPressure).toFixed(2),
        },
        adams: {
          MaxTension: isInvalidValue(data?.port_data?.port_4006?.MaxTension)
            ? lastPerfectResponses.current.adams.MaxTension
            : parseFloat(data.port_data.port_4006.MaxTension).toFixed(2),
          Tension: isInvalidValue(data?.port_data?.port_4006?.Tension)
            ? lastPerfectResponses.current.adams.Tension
            : parseFloat(data.port_data.port_4006.Tension).toFixed(2),
        },
        // ebox: {
        //   InternalTemp: isInvalidValue(data?.port_data?.port_4007?.InternalTemp)
        //     ? lastPerfectResponses.current.ebox.InternalTemp
        //     : data.port_data.port_4007.InternalTemp,

        //   fan1: isInvalidValue(data?.port_data?.port_4007?.fan1) ||
        //     (typeof data?.port_data?.port_4007?.fan1 === 'string' &&
        //       data?.port_data?.port_4007?.fan1.toLowerCase() !== "on" &&
        //       data?.port_data?.port_4007?.fan1.toLowerCase() !== "off")
        //     ? lastPerfectResponses.current.ebox.fan1
        //     : data.port_data.port_4007.fan1,

        //   fan2: isInvalidValue(data?.port_data?.port_4007?.fan2) ||
        //     (typeof data?.port_data?.port_4007?.fan2 === 'string' &&
        //       data?.port_data?.port_4007?.fan2.toLowerCase() !== "on" &&
        //       data?.port_data?.port_4007?.fan2.toLowerCase() !== "off")
        //     ? lastPerfectResponses.current.ebox.fan2
        //     : data.port_data.port_4007.fan2,

        //   position: isInvalidValue(data?.port_data?.port_4007?.position) ||
        //     (typeof data?.port_data?.port_4007?.position === 'string' &&
        //       data?.port_data?.port_4007?.position.toLowerCase() !== "1" &&
        //       data?.port_data?.port_4007?.position.toLowerCase() !== "0")
        //     ? lastPerfectResponses.current.ebox.position
        //     : data.port_data.port_4007.position,

        //   strobe: isInvalidValue(data?.port_data?.port_4007?.strobe) ||
        //     (typeof data?.port_data?.port_4007?.strobe === 'string' &&
        //       data?.port_data?.port_4007?.strobe.toLowerCase() !== "on" &&
        //       data?.port_data?.port_4007?.strobe.toLowerCase() !== "off")
        //     ? lastPerfectResponses.current.ebox.strobe
        //     : data.port_data.port_4007.strobe,
        // },
        time: formatDateTime(),
        loading: data?.connection_status,
        port_4002: data?.port_data?.port_4002?.connectionstatus ? data?.port_data?.port_4002?.connectionstatus : "Disconnected",
        port_4003: data?.port_data?.port_4003?.connectionstatus ? data?.port_data?.port_4003?.connectionstatus : "Disconnected",
        port_4004: data?.port_data?.port_4004?.connectionstatus ? data?.port_data?.port_4004?.connectionstatus : "Disconnected",
        port_4005: data?.port_data?.port_4005?.connectionstatus ? data?.port_data?.port_4005?.connectionstatus : "Disconnected",
        port_4006: data?.port_data?.port_4006?.connectionstatus ? data?.port_data?.port_4006?.connectionstatus : "Disconnected",
      };

      console.log(data)

      lastPerfectResponses.current = {
        ...lastPerfectResponses.current,
        weather: parsedResponses.weather,
        digitalCompass: parsedResponses.digitalCompass,
        ballonet: parsedResponses.ballonet,
        helium: parsedResponses.helium,
        adams: parsedResponses.adams,
        // ebox: parsedResponses.ebox,
      };

      setIsLoading(Object.keys(data).length > 0 ? 0 : 2);
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
        loading: "Disconnected"
      });
    }
  };

  useEffect(() => {
    if (!startFetchingFromFile && startFetchData) {
      const interval = setInterval(fetchData, 500);
      return () => clearInterval(interval);
    }
  }, [startFetchingFromFile, startFetchData]);

  // useEffect(() => {
  //   console.log(responses)
  // }, [responses])


  const [form, setForm] = useState({
    ip: "192.168.0.102",
    weather: "4002",
    hmr: "4003",
    ballonet: "4004",
    helium: "4005",
    adam: "4006",
    ebox: "4007",
  });

  const [errorValues, setErrorValues] = useState([]);


  const handleSubmit = async () => {
    const errors = [];
    // console.log("In Submit")


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

    // console.log("After Checking", form);

    const newForm = {
      ip: form?.ip,
      weather: Number(form?.weather),
      hmr: Number(form?.hmr),
      ballonet: Number(form?.ballonet),
      helium: Number(form?.helium),
      adam: Number(form?.adam),
      ebox: Number(form?.ebox)
    }

    try {
      // console.log("In try")
      setStartFetchData(true);
      setOpenModal(false);
      setStartFetchingFromFile(false);
      setErrorValues([]);
      const result = await updateConfigUtil(newForm);
      if (!result) {
        setStartFetchingFromFile(false);
        setStartFetchData(false);
      }
      console.log("Form successfully posted:", result);
    } catch (error) {
      console.log("In catch")
      // console.log("Error in form posting:", error);
      setOpenModal(false);
      setErrorValues([]);
    }
  };

  const handleOpenModal = () => {
    if (!startFetchingFromFile) {
      setOpenModal(true);
    }
  }

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
      let res = processData(fileContent)
      setfileData(res);

    }
  }, [fileContent]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (startFetchingFromFile && currentIndex < fileData.length) {
        const result = processDataArray([fileData[currentIndex]], currentResult);
        setCurrentResult(result);
        setResponses(result);

        setCurrentIndex(prevIndex => prevIndex + 1);
      }
      else if (currentIndex >= fileData?.length) {
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

        const fileInput = document.getElementById("fileInput");
        if (fileInput) fileInput.value = "";

        const newResponse = {
          adams: { MaxTension: 700, Tension: 10 },
          ballonet: { BalPressure: 0.071 },
          digitalCompass: { Magheading: 240.1, Pitch: 0, Roll: 0 },
          ebox: { InternalTemp: 25.5, fan1: 'ON', fan2: 'ON', position: '1', strobe: 'OFF' },
          helium: { HelPressure: 0.398 },
          weather: { airTemp: 18.8, baroPres: 29.3, heading: 128, windAngle: 158.4, windSpeed: 70 },
          time: formatDateTime()
        };

        setResponses(newResponse);
      }
      // Done
      else {
        clearInterval(intervalId);
      }
    }, fetchingSpeed);

    return () => clearInterval(intervalId);


  }, [fileData, currentIndex, currentResult, startFetchingFromFile, fetchingSpeed]);

  const HandlePlay = () => {
    setStartFetchingFromFile(true);
    setFwdBtn(true);
    setStopBtn(true);
    setStartFetchData(false);
    setPlayBtn(false);
  }
  const HandleForward = () => {
    if (fetchingSpeed > 125) {
      setFetchingSpeed(fetchingSpeed * 0.5);
    }
  }
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

    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = "";

    let tempRes = {
      adams: { MaxTension: 700, Tension: 10 },
      ballonet: { BalPressure: 0.071 },
      digitalCompass: { Magheading: 240.1, Pitch: 0, Roll: 0 },
      ebox: { InternalTemp: 25.5, fan1: 'ON', fan2: 'ON', position: '1', strobe: 'OFF' },
      helium: { HelPressure: 0.398 },
      weather: { airTemp: 18.8, baroPres: 29.3, heading: 128, windAngle: 158.4, windSpeed: 70 },
      time: formatDateTime()
    }

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
      <div style={{ display: 'flex', flexDirection: 'column', rowGap: '0px' }}>
        <Header  handleSidebarOpen={() => setSidebar(true)} time={responses?.time} fileFetching={startFetchingFromFile} />
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
          form={form}
          setForm={setForm}
          handleSubmit={handleSubmit}
          errorValues={errorValues}
          setErrorValues={setErrorValues}
          openModal={openModal}
          setOpenModal={setOpenModal}
          handleOpenModal={handleOpenModal}
          fetchingStart={startFetchData}
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
      <div className={`watermark ${theme === 'light' ? 'watermark-light' : 'watermark-dark'}`}></div>
    </>
  );
}

export default App;
