import './App.css'
import React, { useContext, useEffect } from 'react'
import Header from './components/New-Components/Header'
import NewCompass from './components/New-Components/NewCompass'
import Home from './components/New-Components/Home'
import NewRollMeter from './components/New-Components/NewRollMeter'
import { ThemeContext } from './ThemeHandler'
function App() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.style.setProperty('--main-bg-color', 'var(--main-light-bg-color)');
    } else {
      document.documentElement.style.setProperty('--main-bg-color', 'var(--main-dark-bg-color)');
    }
  }, [theme]);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", rowGap: "0px" }}>
        <Header />
        <Home />
      </div>
      {/* <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <NewCompass />
      </div> */}
      <div className={`watermark ${theme === "light" ? "watermark-light" : "watermark-dark"}`}>
      </div>
    </>
  )
}

export default App
