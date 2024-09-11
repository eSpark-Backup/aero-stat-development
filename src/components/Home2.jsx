import React, { useState } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HighchartsMore from 'highcharts/highcharts-more'
import HighchartsGauge from 'highcharts/modules/solid-gauge'
import { getGaugeOptions } from '../constant'
import { ThemeContext } from '../ThemeHandler'
import Modal from './Modal'

HighchartsMore(Highcharts)
HighchartsGauge(Highcharts)
const Home2 = () => {
    const [form, setForm] = useState({
        ip: "192.168.0.102",
        weather: "4002",
        hmr: "4003",
        ballonet: "4004",
        helium: "4005",
        adam: "4006",
        ebox: "4007",
    })
    const [openModal, setOpenModal] = useState(false);
    const handleClose = () => {
        setOpenModal(false)
    }
    const handleSubmit = () => {
        console.log(form, "success")
        setOpenModal(false)
    }

    const { theme } = React.useContext(ThemeContext);
    const gaugeOptions = getGaugeOptions(theme);
    return (
        <div className={`home-main-container ${theme}`}>
            <div className="home">
                <div className={`data ${theme}`}>
                    <h1>Fri, 30 August 2024, 07:49:01</h1>
                    <h1>Live Data</h1>
                </div>
                <div className="breaker"></div>
                <div className='home-main'>
                    <div className="left">
                        <div className={`box1 ${theme}`}>
                            <div className={`box-head ${theme}`}>
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
                        <div className={`box3 ${theme}`}>
                            <div className={`box-head ${theme}`}>
                                <h1>Pressures (inWG)</h1>
                            </div>
                            <div className="box-body">

                                <div className='magnetometer-boxes'>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={gaugeOptions}
                                    />
                                    <p className={`graph-info ${theme}`}>Hull Helium: <span className={`graph-value ${theme}`}>0.12</span></p>
                                </div>
                                <div className='magnetometer-boxes'>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={gaugeOptions}
                                    />
                                    <p className={`graph-info ${theme}`}>Ballonet Air: <span className={`graph-value ${theme}`}>0.295</span></p>
                                </div>

                            </div>
                        </div>
                        <div className={`box5 ${theme}`}>
                            <div className={`box-head ${theme}`}>
                                <h1>Confluence Point Tension</h1>
                            </div>
                            <div className="box-body">
                                <div className='single-column-box'>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={gaugeOptions}
                                    />
                                    <div style={{ display: "flex", flexDirection: "column", rowGap: "10px" }}>
                                        <p className={`graph-info ${theme}`}>Tension: <span className={`graph-value ${theme}`}>1</span></p>
                                        <p className={`graph-info ${theme}`}>Max Tension: <span className={`graph-value ${theme}`}>1</span></p>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="right">
                        <div className={`box2 ${theme}`}>
                            <div className={`box-head ${theme}`}>
                                <h1>Magnetometer</h1>
                            </div>
                            <div className="box-body">
                                <div className='magnetometer-boxes2'>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={gaugeOptions}
                                    />
                                    <p className={`graph-info ${theme}`}>Ballonet Air: <span className={`graph-value ${theme}`}>0.295</span></p>
                                </div>
                                <div className='magnetometer-boxes2'>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={gaugeOptions}
                                    />
                                    <p className={`graph-info ${theme}`}>Pitch: <span className={`graph-value ${theme}`}>0.2</span></p>
                                </div>
                                <div className='magnetometer-boxes2'>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={gaugeOptions}
                                    />
                                    <p className={`graph-info ${theme}`}>Roll: <span className={`graph-value ${theme}`}>3.9</span></p>
                                </div>

                            </div>
                        </div>
                        <div className="box4">
                            <div className={`control-box ${theme}`}>
                                <div className={`box-head ${theme}`}>
                                    <h1>Radio Link</h1>
                                </div>
                                <div className="box-body">
                                    <div className="statuses">
                                        <div className={`status-box ${theme}`}>
                                            <p>Coms Status:</p>
                                            <div className='load active'></div>
                                            <p>Connected</p>
                                        </div>
                                        <div className='loader'></div>
                                        <div style={{ display: "flex", justifyContent: "center" }} className='btn-group'>
                                            <button style={{ cursor: "pointer" }} onClick={() => setOpenModal(true)}>Config</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`control-box ${theme}`}>
                                <div className={`box-head ${theme}`}>
                                    <h1>Fans Control</h1>
                                </div>
                                <div className="box-body">
                                    <div className="statuses">
                                        <div className={`status-box ${theme}`}>
                                            <p>Fan 1:</p>
                                            <div className='status active'>On</div>
                                        </div>
                                        <div className={`status-box ${theme}`}>
                                            <p>Fan 2:</p>
                                            <div className='status active'>On</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`control-box ${theme}`}>
                                <div className={`box-head ${theme}`}>
                                    <h1>Lights Control</h1>
                                </div>
                                <div className="box-body">
                                    <div className="statuses">
                                        <div className={`status-box ${theme}`}>
                                            <p>Strobe Control:</p>
                                            <div className='status inactive'>On</div>
                                        </div>
                                        <div className={`status-box ${theme}`}>
                                            <p>Position Control:</p>
                                            <div className='status inactive'>On</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`box2 ${theme}`}>
                            <div className={`box-head ${theme}`}>
                                <h1>Weather Station</h1>
                            </div>
                            <div className="box-body">
                                <div className='weather-boxes'>

                                    <div style={{ display: "flex", flexDirection: "column", rowGap: "10px" }}>
                                        <p style={{ fontSize: "16px", fontWeight: "600", textAlign: "center", color: "#FF0000" }}>Aerostat Heading</p>
                                        <p style={{ fontSize: "16px", fontWeight: "600", textAlign: "center", color: "#0075FF" }}>Wind Angle</p>
                                    </div>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={gaugeOptions}
                                    />

                                </div>
                                <div className='weather-boxes'>

                                    <div style={{ display: "flex", flexDirection: "column", rowGap: "10px" }}>
                                        <p className={`graph-info ${theme}`}>Air Temp (c):<span className={`graph-value ${theme}`}>15</span></p>
                                        <p className={`graph-info ${theme}`}>Bare Pres (intig):<span className={`graph-value ${theme}`}>292</span></p>
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
            <Modal
                theme={theme}
                open={openModal}
                handleClose={handleClose}
                handleSubmit={handleSubmit}
                form={form}
                setForm={setForm}
            />
        </div>
    )
}

export default Home2
