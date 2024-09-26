import './App.css'
import React from 'react'
import Header from './components/New-Components/Header'
import NewCompass from './components/New-Components/NewCompass'
import Home from './components/New-Components/Home'
import NewRollMeter from './components/New-Components/NewRollMeter'
function App() {


  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", rowGap: "0px" }}>
        <Header />
        <Home />
      </div>
      {/* <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <NewRollMeter />
      </div> */}
    </>
  )
}

export default App
