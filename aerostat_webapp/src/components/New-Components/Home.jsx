import React from 'react'
import MainCard from '../../common/MainCard'
import ChildCard from '../../common/ChildCard'
import StatusChip from '../../common/StatusChip'
import NewCompass from './NewCompass'
import play from "../../assets/play.svg"
import forward from "../../assets/forward.svg"
import stop from "../../assets/stop.svg"

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";
import HighchartsGauge from "highcharts/modules/solid-gauge";
import { getGaugeOptions } from '../../constant'
import ChartsData from '../../common/ChartsData'
import OptionBox from '../../common/OptionBox'
import ChartChip from '../../common/ChartChip'
import NewRollMeter from './NewRollMeter'

HighchartsMore(Highcharts);
HighchartsGauge(Highcharts);

const Home = () => {
    return (
        <div className="main">
            <div className="box1">
                <MainCard title={"Weather Station"}>
                    <div className='weather-station-card'>
                        <ChildCard>
                            <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", rowGap: "40px", paddingTop: "10px" }}>
                                <NewCompass />
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
                            options={getGaugeOptions("light", -1, 6, [2.3])}
                        />
                        <ChartsData position={"between"} />
                    </div>
                </MainCard>
                <MainCard title={"Controls"}>
                    <div className="controls-box">
                        <h2>Fan Control</h2>
                        <div className='fan-box'>
                            <p>Fan 1 <span>(Left direction)</span></p>
                            <OptionBox option1={"Continuous"} option2={"Pressured"} selectedOption={"Continuous"} />
                        </div>
                        <div className='fan-box'>
                            <p>Fan 2 <span>(Right direction)</span></p>
                            <OptionBox option1={"Continuous"} option2={"Pressured"} selectedOption={"Pressured"} />
                        </div>
                        <h2>Lights Control</h2>
                        <div className='fan-box'>
                            <p>Strobe Control</p>
                            <OptionBox option1={"Continuous"} option2={"Off"} selectedOption={"Continuous"} />
                        </div>
                        <div className='fan-box'>
                            <p>Position Control</p>
                            <OptionBox option1={"Continuous"} option2={"Off"} selectedOption={"off"} />
                        </div>
                    </div>
                </MainCard>
            </div>
            <div className="box2">
                <div className="preferences">
                    <p>Preference</p>
                    <div className="choice">
                        <div className="theme"></div>
                        <p className='theme-text'>Light</p>
                    </div>
                </div>
                <MainCard title={"Magnetometer"}>
                    <div className='magnetometer-box'>
                        <div className="heading-box">
                            <ChildCard>
                                <div className="heading-box-content">
                                    <ChartChip name={"Heading"} value={23.9} />
                                    <NewCompass />
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
                                        options={getGaugeOptions("light", -1, 6, [2.3])}
                                    />
                                    <ChartsData position={"around"} />
                                </div>
                                <div>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={getGaugeOptions("light", -1, 6, [2.3])}
                                    />
                                    <ChartsData position={"around"} />
                                </div>
                            </div>
                        </MainCard>
                    </div>
                    <div className="confluence-box">
                        <MainCard title={"Confluence Point Tension"}>
                            <div className="confluence-box-content">
                                <ChartChip name={"Heading"} value={23.9} />
                                <div className='confluence-graph'>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={getGaugeOptions("light", -1, 6, [2.3])}
                                    />
                                    <ChartsData position={"center"} />
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
                                    <div className='log-detail'>
                                        <p>RF Link:</p>
                                        <StatusChip color={"green"} description={"Connected"} />
                                    </div>
                                    <div className="loading-bar">
                                        <div className="progress"></div>
                                    </div>
                                    <div className='log-detail'>
                                        <p>RF Link:</p>
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
