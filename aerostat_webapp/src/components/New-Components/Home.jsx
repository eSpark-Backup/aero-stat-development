import React, { useContext } from 'react'
import MainCard from '../../common/MainCard'
import ChildCard from '../../common/ChildCard'
import StatusChip from '../../common/StatusChip'
import NewCompass from './NewCompass'
import play from "../../assets/play.svg"
import forward from "../../assets/forward.svg"
import stop from "../../assets/stop.svg"
import ChartsData from '../../common/ChartsData'
import OptionBox from '../../common/OptionBox'
import ChartChip from '../../common/ChartChip'
import NewRollMeter from './NewRollMeter'

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";
import HighchartsGauge from "highcharts/modules/solid-gauge";
import { confluenceGaugeOptions, pressureGaugeOptions, windGaugeOptions } from '../../constant'
import { ThemeContext } from '../../ThemeHandler'

HighchartsMore(Highcharts);
HighchartsGauge(Highcharts);

const Home = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    return (
        <div className="main">
            <div className="box1">
                <MainCard title={"Weather Station"}>
                    <div className='weather-station-card'>
                        <ChildCard>
                            <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", rowGap: "40px", paddingTop: "10px" }}>
                                <NewCompass needle1={260} needle2={110} />
                                <div className='weather-station-chips'>
                                    <StatusChip color={"blue"} description={"Wind Angle"} />
                                    <StatusChip color={"red"} description={"Aerostats Heading"} />
                                </div>
                            </div>
                        </ChildCard>
                    </div>
                </MainCard>
                <MainCard title={"Wind Speed"}>
                    <div className='wind-speed-card'>
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={windGaugeOptions("light", 0, 70, [2])}
                        />
                        <ChartsData position={"between"} description1={"Air Temp (C):"} value1={15} description2={"Bare Press (inHg):"} value2={292} graphValue={0.295} graphName={"Wind Speed"} />
                    </div>
                </MainCard>
                <MainCard title={"Controls"}>
                    <div className={`controls-box ${theme === "light" ? "controls-box-light" : "controls-box-dark"}`}>
                        <h2>Fan Control</h2>
                        <div className={`fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"}`}>
                            <p>Fan 1 <span>(Left direction)</span></p>
                            <OptionBox option1={"Continuous"} option2={"Pressured"} selectedOption={"Continuous"} />
                        </div>
                        <div className={`fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"}`}>
                            <p>Fan 2 <span>(Right direction)</span></p>
                            <OptionBox option1={"Continuous"} option2={"Pressured"} selectedOption={"Pressured"} />
                        </div>
                        <h2>Lights Control</h2>
                        <div className={`fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"}`}>
                            <p>Strobe Control</p>
                            <OptionBox option1={"Continuous"} option2={"Off"} selectedOption={"Continuous"} />
                        </div>
                        <div className={`fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"}`}>
                            <p>Position Control</p>
                            <OptionBox option1={"Continuous"} option2={"Off"} selectedOption={"off"} />
                        </div>
                    </div>
                </MainCard>
            </div>
            <div className="box2">
                <div className={`preferences ${theme === "light" ? "preferences-light" : "preferences-dark"}`}>
                    <p>Preference</p>
                    <div className={`choice ${theme === "light" ? "choice-light" : "choice-dark"}`}>
                        {
                            theme === "light"
                                ?
                                <>
                                    <div className="theme-light"></div>
                                    <p className='theme-text-light'>Light</p>
                                </>
                                :
                                <>
                                    <p className='theme-text-dark'>Dark</p>
                                    <div className="theme-dark"></div>
                                </>
                        }
                    </div>
                </div>
                <MainCard title={"Magnetometer"}>
                    <div className='magnetometer-box'>
                        <div className="heading-box">
                            <ChildCard>
                                <div className="heading-box-content">
                                    <ChartChip name={"Heading"} value={23.9} />
                                    <NewCompass needle1={260} />
                                </div>
                            </ChildCard>
                        </div>
                        <div className="heading-box2">
                            <ChildCard>
                                <div className="pitch-box-content">
                                    <div className='pitch-roll-chips'>
                                        <ChartChip name={"Roll:"} value={"2 degree"} />
                                        <ChartChip name={"Pitch:"} value={"2 degree"} />
                                    </div>
                                    <NewRollMeter />
                                </div>
                            </ChildCard>
                        </div>
                    </div>
                </MainCard>
                <div className="horizontal-box1">
                    <div className="pressure-box">
                        <MainCard title={"Pressures (inWG)"}>
                            <div className="pressure-box-content">
                                <div>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={pressureGaugeOptions("light", 0, 6, [4])}
                                    />
                                    <ChartsData position={"around"} graphValue={0.295} graphName={"Hull Helium"} />
                                </div>
                                <div>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={pressureGaugeOptions("light", 0, 6, [0.295])}
                                    />
                                    <ChartsData position={"around"} graphValue={0.295} graphName={"Ballonet Air"} />
                                </div>
                            </div>
                        </MainCard>
                    </div>
                    <div className="confluence-box">
                        <MainCard title={"Confluence Point Tension"}>
                            <div className="confluence-box-content">
                                <ChartChip name={"Max Tension"} value={23.9} />
                                <div className='confluence-graph'>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={confluenceGaugeOptions("light", 0, 700, [100])}
                                    />
                                    <ChartsData position={"center"} graphName={"Current Tension"} graphValue={1} />
                                </div>
                            </div>
                        </MainCard>
                    </div>
                </div>
                <div className="horizontal-box2">
                    <div className="radio-box">
                        <MainCard title={"Radio Link"}>
                            <div className='radio-box-content'>
                                <div className='config-box'>
                                    <div className={`log-detail ${theme === "light" ? "log-detail-light" : "log-detail-dark"}`}>
                                        <p>RF Link:</p>
                                        <StatusChip color={"green"} description={"Connected"} />
                                    </div>
                                    <div className="loading-bar">
                                        <div className="progress"></div>
                                    </div>
                                    <div className={`log-detail ${theme === "light" ? "log-detail-light" : "log-detail-dark"}`}>
                                        <p>Tether Link:</p>
                                        <StatusChip color={"green"} description={"Connected"} />
                                    </div>
                                    <div className="loading-bar">
                                        <div className="progress"></div>
                                    </div>
                                    <button>Config</button>

                                </div>
                                <div className='config-details'>
                                    <h1>Details</h1>
                                    <div className='config-details-items'>
                                        <div>
                                            <p>GCS Address</p>
                                            <div className='config-info'>
                                                <p>192.168.0.102</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p>Weather Station Port</p>
                                            <div className='config-info'>
                                                <p>4002</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p>HMR Port  </p>
                                            <div className='config-info'>
                                                <p>4003</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p>Ballonet Pressure Port</p>
                                            <div className='config-info'>
                                                <p>4004</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p>Helium Pressure Port</p>
                                            <div className='config-info'>
                                                <p>4005</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p>ADAM Port</p>
                                            <div className='config-info'>
                                                <p>4006</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p>EBox Port</p>
                                            <div className='config-info'>
                                                <p>4007</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </MainCard>
                    </div>
                    <div className="log-box">
                        <MainCard title={"Data Logging"}>
                            <div className='log-box-content'>
                                <div className="log-input-box">
                                    <p>Log File</p>
                                    <div className='file-name-box'>Aero/Nw7/Fgs/70082024</div>
                                    <button>Browse</button>
                                </div>
                                <div className="button-groups">
                                    <div className="tdbutton">
                                        <div className="upper-part">
                                            <img src={play} alt="" />
                                        </div>
                                    </div>
                                    <div className="tdbutton">
                                        <div className="upper-part">
                                            <img src={forward} alt="" />
                                        </div>
                                    </div>
                                    <div className="tdbutton">
                                        <div className="upper-part">
                                            <img src={stop} alt="" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </MainCard>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home
