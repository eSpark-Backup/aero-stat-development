import './App.css'
import React from 'react'
import Header from './components/New-Components/Header'
import NewCompass from './components/New-Components/NewCompass'
import Home from './components/New-Components/Home'
function App() {


  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", rowGap: "0px" }}>
        <Header />
        <Home />
      </div>
    </>
  )
}

export default App
