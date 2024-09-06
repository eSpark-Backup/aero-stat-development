import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HighchartsMore from 'highcharts/highcharts-more'
import HighchartsGauge from 'highcharts/modules/solid-gauge'
import { gaugeOptions } from '../constant'

HighchartsMore(Highcharts)
HighchartsGauge(Highcharts)
const Home2 = () => {
    return (
        <div className='home-main-container'>
            <div className="home">
                <div className="data">
                    <h1>Fri, 30 August 2024, 07:49:01</h1>
                    <h1>Live Data</h1>
                </div>
                <div className='home-main'>
                    <div className="left">
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
                        <div className="box3">
                            <div className="box-head">
                                <h1>Magnetometer</h1>
                            </div>
                            <div className="box-body">

                                <div className='magnetometer-boxes'>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={gaugeOptions}
                                    />
                                    <p style={{ fontSize: "16px", fontWeight: "600", textAlign: "center" }}>Pitch: <span style={{ fontSize: "16px", color: "#0029FF" }}>0.2</span></p>
                                </div>
                                <div className='magnetometer-boxes'>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={gaugeOptions}
                                    />
                                    <p style={{ fontSize: "16px", fontWeight: "600", textAlign: "center" }}>Roll: <span style={{ fontSize: "16px", color: "#0029FF" }}>3.9</span></p>
                                </div>

                            </div>
                        </div>
                        <div className="box5">
                            <div className="box-head">
                                <h1>Confluence Point Tension</h1>
                            </div>
                            <div className="box-body">
                                <div className='magnetometer-boxes'>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={gaugeOptions}
                                    />
                                    <div style={{ display: "flex", flexDirection: "column", rowGap: "10px" }}>
                                        <p style={{ fontSize: "16px", fontWeight: "600", textAlign: "center" }}>Tension: <span style={{ fontSize: "16px", color: "#0029FF" }}>1</span></p>
                                        <p style={{ fontSize: "16px", fontWeight: "600", textAlign: "center" }}>Max Tension: <span style={{ fontSize: "16px", color: "#0029FF" }}>1</span></p>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="right">
                        <div className="box2">
                            <div className="box-head">
                                <h1>Magnetometer</h1>
                            </div>
                            <div className="box-body">
                                <div className='magnetometer-boxes'>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={gaugeOptions}
                                    />
                                    <p style={{ fontSize: "16px", fontWeight: "600", textAlign: "center" }}>Ballonet Air: <span style={{ fontSize: "16px", color: "#0029FF" }}>0.295</span></p>
                                </div>
                                <div className='magnetometer-boxes'>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={gaugeOptions}
                                    />
                                    <p style={{ fontSize: "16px", fontWeight: "600", textAlign: "center" }}>Pitch: <span style={{ fontSize: "16px", color: "#0029FF" }}>0.2</span></p>
                                </div>
                                <div className='magnetometer-boxes'>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={gaugeOptions}
                                    />
                                    <p style={{ fontSize: "16px", fontWeight: "600", textAlign: "center" }}>Roll: <span style={{ fontSize: "16px", color: "#0029FF" }}>3.9</span></p>
                                </div>

                            </div>
                        </div>
                        <div className="box4">
                            <div className="control-box">
                                <div className="box-head">
                                    <h1>Fans Control</h1>
                                </div>
                                <div className="box-body">
                                    <div className="statuses">
                                        <div className="status-box">
                                            <p>Fan 1:</p>
                                            <div className='status active'>On</div>
                                        </div>
                                        <div className="status-box">
                                            <p>Fan 2:</p>
                                            <div className='status active'>On</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="control-box">
                                <div className="box-head">
                                    <h1>Radio Link</h1>
                                </div>
                                <div className="box-body">
                                    <div className="statuses">
                                        <div className="status-box">
                                            <p>Coms Status:</p>
                                            <div className='load active'></div>
                                            <p>Connected</p>
                                        </div>
                                        <div className='loader'></div>

                                    </div>
                                </div>
                            </div>
                            <div className="control-box">
                                <div className="box-head">
                                    <h1>Fans Control</h1>
                                </div>
                                <div className="box-body">
                                    <div className="statuses">
                                        <div className="status-box">
                                            <p>Strobe Control:</p>
                                            <div className='status inactive'>On</div>
                                        </div>
                                        <div className="status-box">
                                            <p>Position Control:</p>
                                            <div className='status inactive'>On</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="box2">
                            <div className="box-head">
                                <h1>Weather Station</h1>
                            </div>
                            <div className="box-body">
                                <div style={{ width: "46%", display: "flex", paddingBottom: "20px", alignItems: "center" }}>

                                    <div style={{ display: "flex", flexDirection: "column", rowGap: "10px" }}>
                                        <p style={{ fontSize: "16px", fontWeight: "600", textAlign: "center" }}>Aerostat Heading</p>
                                        <p style={{ fontSize: "16px", fontWeight: "600", textAlign: "center" }}>Wind Angle</p>
                                    </div>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={gaugeOptions}
                                    />

                                </div>
                                <div style={{ width: "46%", display: "flex", paddingBottom: "20px", alignItems: "center" }}>

                                    <div style={{ display: "flex", flexDirection: "column", rowGap: "10px" }}>
                                        <p style={{ fontSize: "16px", fontWeight: "600", textAlign: "center" }}>Air Temp (c):<span style={{ fontSize: "16px", color: "#0029FF" }}>15</span></p>
                                        <p style={{ fontSize: "16px", fontWeight: "600", textAlign: "center" }}>Bare Pres (intig):<span style={{ fontSize: "16px", color: "#0029FF" }}>292</span></p>
                                    </div>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={gaugeOptions}
                                    />

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home2
