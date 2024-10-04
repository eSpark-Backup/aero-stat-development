import './App.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Header from './components/New-Components/Header';
import Home from './components/New-Components/Home';
import { ThemeContext } from './ThemeHandler';
import { fetchDataUtil, updateConfigUtil } from './utils';
import { formatDateTime, processData, processDataArray } from './Js_parsing';
import { time } from 'highcharts';

function App() {

  const lastPerfectResponses = useRef({
    adams: { MaxTension: 700, Tension: 10 },
    ballonet: { BalPressure: 0.071 },
    digitalCompass: { Magheading: 240.1, Pitch: 0, Roll: 0 },
    ebox: { InternalTemp: 25.5, fan1: 'ON', fan2: 'ON', position: '1', strobe: 'OFF' },
    helium: { HelPressure: 0.398 },
    weather: { airTemp: 18.8, baroPres: 29.3, heading: 128, windAngle: 158.4, windSpeed: 70 },
  });

  const { theme } = useContext(ThemeContext);
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

  const fetchData = async () => {
    fetchDataUtil((data) => {
      const parsedResponses = {
        weather: {
          airTemp: !data?.port_data?.port_4002?.airTemp || data?.port_data?.port_4002?.airTemp === "none" || isNaN(data?.port_data?.port_4002?.airTemp)
            ? lastPerfectResponses.current.weather.airTemp
            : data.port_data.port_4002.airTemp,

          baroPres: !data?.port_data?.port_4002?.baroPres || data?.port_data?.port_4002?.baroPres === "none" || isNaN(data?.port_data?.port_4002?.baroPres)
            ? lastPerfectResponses.current.weather.baroPres
            : data.port_data.port_4002.baroPres,

          heading: !data?.port_data?.port_4002?.heading || data?.port_data?.port_4002?.heading === "none" || isNaN(data?.port_data?.port_4002?.heading)
            ? lastPerfectResponses.current.weather.heading
            : data.port_data.port_4002.heading,

          windAngle: !data?.port_data?.port_4002?.windAngle || data?.port_data?.port_4002?.windAngle === "none" || isNaN(data?.port_data?.port_4002?.windAngle)
            ? lastPerfectResponses.current.weather.windAngle
            : data.port_data.port_4002.windAngle,

          windSpeed: !data?.port_data?.port_4002?.windSpeed || data?.port_data?.port_4002?.windSpeed === "none" || isNaN(data?.port_data?.port_4002?.windSpeed)
            ? lastPerfectResponses.current.weather.windSpeed
            : data.port_data.port_4002.windSpeed,
        },
        digitalCompass: {
          Magheading: !data?.port_data?.port_4003?.Magheading || data?.port_data?.port_4003?.Magheading === "none" || isNaN(data?.port_data?.port_4003?.Magheading)
            ? lastPerfectResponses.current.digitalCompass.Magheading
            : data.port_data.port_4003.Magheading,

          Pitch: !data?.port_data?.port_4003?.Pitch || data?.port_data?.port_4003?.Pitch === "none" || isNaN(data?.port_data?.port_4003?.Pitch)
            ? lastPerfectResponses.current.digitalCompass.Pitch
            : data.port_data.port_4003.Pitch,

          Roll: !data?.port_data?.port_4003?.Roll || data?.port_data?.port_4003?.Roll === "none" || isNaN(data?.port_data?.port_4003?.Roll)
            ? lastPerfectResponses.current.digitalCompass.Roll
            : data.port_data.port_4003.Roll,
        },
        ballonet: {
          BalPressure: !data?.port_data?.port_4004?.BalPressure || data?.port_data?.port_4004?.BalPressure === "none" || isNaN(data?.port_data?.port_4004?.BalPressure)
            ? lastPerfectResponses.current.ballonet.BalPressure
            : data.port_data.port_4004.BalPressure,
        },
        helium: {
          HelPressure: !data?.port_data?.port_4005?.HelPressure || data?.port_data?.port_4005?.HelPressure === "none" || isNaN(data?.port_data?.port_4005?.HelPressure)
            ? lastPerfectResponses.current.helium.HelPressure
            : data.port_data.port_4005.HelPressure,
        },
        adams: {
          MaxTension: !data?.port_data?.port_4006?.MaxTension || data?.port_data?.port_4006?.MaxTension === "none" || isNaN(data?.port_data?.port_4006?.MaxTension)
            ? lastPerfectResponses.current.adams.MaxTension
            : data.port_data.port_4006.MaxTension,

          Tension: !data?.port_data?.port_4006?.Tension || data?.port_data?.port_4006?.Tension === "none" || isNaN(data?.port_data?.port_4006?.Tension)
            ? lastPerfectResponses.current.adams.Tension
            : data.port_data.port_4006.Tension,
        },
        ebox: {
          InternalTemp: !data?.port_data?.port_4007?.InternalTemp || data?.port_data?.port_4007?.InternalTemp === "none" || isNaN(data?.port_data?.port_4007?.InternalTemp)
            ? lastPerfectResponses.current.ebox.InternalTemp
            : data.port_data.port_4007.InternalTemp,
          fan1: !data?.port_data?.port_4007?.fan1 || data?.port_data?.port_4007?.fan1 === "none"
            ? lastPerfectResponses.current.ebox.fan1
            : data.port_data.port_4007.fan1,

          fan2: !data?.port_data?.port_4007?.fan2 || data?.port_data?.port_4007?.fan2 === "none"
            ? lastPerfectResponses.current.ebox.fan2
            : data.port_data.port_4007.fan2,

          position: !data?.port_data?.port_4007?.position || data?.port_data?.port_4007?.position === "none"
            ? lastPerfectResponses.current.ebox.position
            : data.port_data.port_4007.position,

          strobe: !data?.port_data?.port_4007?.strobe || data?.port_data?.port_4007?.strobe === "none"
            ? lastPerfectResponses.current.ebox.strobe
            : data.port_data.port_4007.strobe,
        },
        time: formatDateTime(),
        loading: data?.connection_status
      };
      // console.log("AP DATAAAAAAAAAAAAAAAAAAAAAAA",data);
      lastPerfectResponses.current = {
        ...lastPerfectResponses.current,
        weather: parsedResponses.weather,
        digitalCompass: parsedResponses.digitalCompass,
        ballonet: parsedResponses.ballonet,
        helium: parsedResponses.helium,
        adams: parsedResponses.adams,
        ebox: parsedResponses.ebox,
      };
      if (Object.keys(data).length > 0) {
        setIsLoading(0);
      }
      else {
        setIsLoading(2);
      }
      console.log("Parsed Responses",parsedResponses);
      setResponses(parsedResponses);
    });
  };

  useEffect(() => {
    if (!startFetchingFromFile && startFetchData) {
      const interval = setInterval(fetchData, 1000);
      return () => clearInterval(interval);
    }
  }, [startFetchingFromFile, startFetchData]);


  const [form, setForm] = useState({
    ip: "192.168.100.5",
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

    try {
      // console.log("In try")
      setStartFetchData(true);
      setOpenModal(false);
      setStartFetchingFromFile(false);
      setErrorValues([]);
      const result = await updateConfigUtil(form);
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
        <Header time={responses?.time} fileFetching={startFetchingFromFile} />
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
