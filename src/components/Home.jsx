import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HighchartsMore from 'highcharts/highcharts-more' // Import the additional module
import HighchartsGauge from 'highcharts/modules/solid-gauge' // Import the gauge module
import { gaugeOptions } from '../constant'

// Initialize Highcharts with the additional modules
HighchartsMore(Highcharts)
HighchartsGauge(Highcharts)

const Home = () => {


    return (
        <div className='home-main-container'>
            <div className="home">
                <div className="data">
                    <h1>Fri, 30 August 2024, 07:49:01</h1>
                    <h1>Live Data</h1>
                </div>
                <div className="breaker"></div>
                <div className="data-boxes">
                    <div className="box1">
                        <div className="box-head">
                            <h1>Data Logging</h1>
                        </div>
                        <div className="box-body">
                            <div className="box-content">
                                <div>
                                    <label htmlFor="logFile">Log File</label>
                                    <div className='input-box'>
                                        <input type="text" id="logFile" defaultValue={"Aero/Nw7/Fgs/70082024"} />
                                        <button>Browse</button>
                                    </div>
                                </div>
                                <div className='btn-group'>
                                    <button>Play</button>
                                    <button>FWD</button>
                                    <button>Stop</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="box2">
                        <div className="box-head">
                            <h1>Magnetometer</h1>
                        </div>
                        <div className="box-body">
                            <div style={{ width: "30%", display: "flex", rowGap: "10px", flexDirection: "column", paddingBottom: "20px" }}>
                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={gaugeOptions}
                                />
                                <p style={{ fontSize: "16px", fontWeight: "600", textAlign: "center" }}>Ballonet Air: <span style={{ fontSize: "16px", color: "#0029FF" }}>0.295</span></p>
                            </div>
                            <div style={{ width: "30%", display: "flex", rowGap: "10px", flexDirection: "column", paddingBottom: "20px" }}>
                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={gaugeOptions}
                                />
                                <p style={{ fontSize: "16px", fontWeight: "600", textAlign: "center" }}>Pitch: <span style={{ fontSize: "16px", color: "#0029FF" }}>0.2</span></p>
                            </div>
                            <div style={{ width: "30%", display: "flex", rowGap: "10px", flexDirection: "column", paddingBottom: "20px" }}>
                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={gaugeOptions}
                                />
                                <p style={{ fontSize: "16px", fontWeight: "600", textAlign: "center" }}>Roll: <span style={{ fontSize: "16px", color: "#0029FF" }}>3.9</span></p>
                            </div>

                        </div>
                    </div>
                    <div className="box3">
                        <div className="box-head">
                            <h1>Magnetometer</h1>
                        </div>
                        <div className="box-body">

                            <div style={{ width: "45%", display: "flex", flexDirection: "column", paddingBottom: "20px" }}>
                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={gaugeOptions}
                                />
                                <p style={{ fontSize: "16px", fontWeight: "600", textAlign: "center" }}>Pitch: <span style={{ fontSize: "16px", color: "#0029FF" }}>0.2</span></p>
                            </div>
                            <div style={{ width: "45%", display: "flex", flexDirection: "column", paddingBottom: "20px" }}>
                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={gaugeOptions}
                                />
                                <p style={{ fontSize: "16px", fontWeight: "600", textAlign: "center" }}>Roll: <span style={{ fontSize: "16px", color: "#0029FF" }}>3.9</span></p>
                            </div>

                        </div>
                    </div>
                    <div className="box4">
                        <div className="boxes"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home
