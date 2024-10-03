import './App.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Header from './components/New-Components/Header';
import Home from './components/New-Components/Home';
import { ThemeContext } from './ThemeHandler';
import { fetchDataUtil } from './utils';
import { formatDateTime } from './Js_parsing';
import { time } from 'highcharts';

function App() {
  const { theme } = useContext(ThemeContext);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

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


  const [startFetchingFromFile, setStartFetchingFromFile] = useState(false);

  const lastPerfectResponses = useRef({
    adams: { MaxTension: 700, Tension: 10 },
    ballonet: { BalPressure: 0.071 },
    digitalCompass: { Magheading: 240.1, Pitch: 0, Roll: 0 },
    ebox: { InternalTemp: 25.5, fan1: 'ON', fan2: 'ON', position: '1', strobe: 'OFF' },
    helium: { HelPressure: 0.398 },
    weather: { airTemp: 18.8, baroPres: 29.3, heading: 128, windAngle: 158.4, windSpeed: 70 },
  });

  const [responses, setResponses] = useState(lastPerfectResponses.current);
  const [isLoading, setIsLoading] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [startFetchData, setStartFetchData] = useState(false);


  const fetchData = async () => {
    try {
      const results = await fetchDataUtil();
      const parsedResponses = {
        weather: results.port_4002 || lastPerfectResponses.current.weather,
        digitalCompass: results.port_4003 || lastPerfectResponses.current.digitalCompass,
        ballonet: results.port_4004 || lastPerfectResponses.current.ballonet,
        helium: results.port_4005 || lastPerfectResponses.current.helium,
        adams: results.port_4006 || lastPerfectResponses.current.adams,
        ebox: results.port_4007 || lastPerfectResponses.current.ebox,
        time: formatDateTime(),
      };
      lastPerfectResponses.current = {
        ...lastPerfectResponses.current,
        weather: parsedResponses.weather,
        digitalCompass: parsedResponses.digitalCompass,
        ballonet: parsedResponses.ballonet,
        helium: parsedResponses.helium,
        adams: parsedResponses.adams,
        ebox: parsedResponses.ebox,
      };
      if (Object.keys(results).length > 0) {
        setIsLoading(0);
      }
      else {
        setIsLoading(2);
      }
      setResponses(parsedResponses);
    } catch (error) {
      setIsLoading(2);
      console.error("Error in fetchData:", error);
    }
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
        setStartFetchData(true);
        setErrorValues([]);
      }
    } catch (error) {
      console.log("Error in form posting:", error);
      setOpenModal(false);
      setErrorValues([]);
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  }


  if (!isThemeLoaded) {
    return null;
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', rowGap: '0px' }}>
        <Header time={responses?.time} />
        <Home
          response={responses}
          isLoading={isLoading}
          form={form}
          setForm={setForm}
          handleSubmit={handleSubmit}
          errorValues={errorValues}
          setErrorValues={setErrorValues}
          openModal={openModal}
          setOpenModal={setOpenModal}
          handleOpenModal={handleOpenModal}
          fetchingStart={startFetchData}
        />
      </div>
      <div className={`watermark ${theme === 'light' ? 'watermark-light' : 'watermark-dark'}`}></div>
    </>
  );
}

export default App;
