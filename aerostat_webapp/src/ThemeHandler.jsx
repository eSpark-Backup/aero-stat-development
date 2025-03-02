import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

const ThemeHandler = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return window.localStorage.getItem("theme") || "light";
  });

  const [phase, setPhase] = useState(2);
  const [phase2Start, setPhase2Start] = useState(false);
  const [phase1Start, setPhase1Start] = useState(false);
  const [isPhase1Starts, setIsPhase1Starts] = useState(false);
  const [isPhase2Starts, setIsPhase2Starts] = useState(false);
  const [fileFetchingStart, setFileFetchingStart] = useState(false);
  console.log("Initial Phase:", phase);

  useEffect(() => {
    console.log("Phase Updated:", phase);
  }, [phase]);
  const [form, setForm] = useState({
    rawtcp_host_ip: "172.17.0.2",
    weather: "4002",
    hmr: "4003",
    ballonet: "4004",
    helium: "4005",
    adam: "4006",
    ebox: "4007",
    modbustcp_host_ip: "10.85.5.13",
    relayIp: "10.85.5.12",
    relayPort: "4196",
  });

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    window.localStorage.setItem("theme", newTheme);
  };
  useEffect(() => {
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        phase,
        setPhase,
        form,
        setForm,
        phase2Start,
        setPhase2Start,
        phase1Start,
        setPhase1Start,
        setIsPhase1Starts,
        isPhase1Starts,
        setIsPhase2Starts,
        isPhase2Starts,
        fileFetchingStart,
        setFileFetchingStart,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeHandler;
