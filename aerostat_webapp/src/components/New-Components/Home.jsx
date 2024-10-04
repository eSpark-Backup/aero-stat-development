import React, { useContext, useState, useEffect, useRef } from 'react'
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
import { useWindowWidth, sendDeviceCommands } from '../../utils'
import Modal from '../Modal'
import { formatDateTime } from '../../Js_parsing'

HighchartsMore(Highcharts);
HighchartsGauge(Highcharts);

const Home = ({
    form, setForm, handleSubmit, errorValues, setErrorValues, response, isLoading, openModal, setOpenModal, handleOpenModal, fetchingStart, HandleBrowse, fileName, HandlePlay, HandleForward, HandleStop, playBtn, fwdBtn, StopBtn

}) => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const width = useWindowWidth();
    const getChartSize = () => (width >= 1280 && width <= 1440) ? 200 : 260
    const getCompassSize = () => (width >= 1280 && width <= 1440) ? true : false;
    // const [openModal, setOpenModal] = useState(false);

    const [fan1, setFan1] = useState(response?.ebox?.fan1 === "ON" ? "Continuous" : "Pressured");
    const [fan2, setFan2] = useState(response?.ebox?.fan2 === "ON" ? "Continuous" : "Pressured");
    const [position, setPosition] = useState(response?.ebox?.position === "1" ? "Continuous" : "Off");
    const [strobe, setStrobe] = useState(response?.ebox?.strobe === "ON" ? "Continuous" : "Off");
    const [sendData, setSendData] = useState(false);

    const handleChange = (name, value) => {
        if (fetchingStart) {
            switch (name) {
                case 'fan1':
                    setFan1(value);
                    setSendData(true);
                    break;
                case 'fan2':
                    setFan2(value);
                    setSendData(true);
                    break;
                case 'position':
                    setPosition(value);
                    setSendData(true);
                    break;
                case 'strobe':
                    setStrobe(value);
                    setSendData(true);
                    break;
                default:
                    break;
            }
        }
    };

    useEffect(() => {
        let FansLight = {
            Fans: null,
            Lights: null
        };
        if (fan1 === "Continuous" && fan2 === "Continuous") {
            FansLight.Fans = "@01DO00\r";
        } else if (fan1 === "Continuous" && fan2 === "Pressured") {
            FansLight.Fans = "@01DO02\r";
        } else if (fan1 === "Pressured" && fan2 === "Continuous") {
            FansLight.Fans = "@01DO01\r";
        } else if (fan1 === "Pressured" && fan2 === "Pressured") {
            FansLight.Fans = "@01DO03\r";
        }
        if (strobe === "Continuous" && position === "Continuous") {
            FansLight.Lights = "@01DO10\r";
        } else if (strobe === "Continuous" && position === "Off") {
            FansLight.Lights = "@01DO12\r";
        } else if (strobe === "Off" && position === "Continuous") {
            FansLight.Lights = "@01DO11\r";
        } else if (strobe === "Off" && position === "Off") {
            FansLight.Lights = "@01DO13\r";
        }
        if (sendData) {
            sendDeviceCommands(FansLight, (response) => {
                // console.log('Handled response:', response);
            });
            setSendData(false);
        }

    }, [fan1, fan2, strobe, position]);

    useEffect(() => {
        setFan1(response?.ebox?.fan1 === "ON" ? "Continuous" : "Pressured");
        setFan2(response?.ebox?.fan2 === "ON" ? "Continuous" : "Pressured");
        setStrobe(response?.ebox?.strobe === "ON" ? "Continuous" : "Off");
        setPosition(response?.ebox?.position === "1" ? "Continuous" : "Off");
        // console.log(response)
    }, [response])

    return (
        <>
            <div className="main">
                <div className={`preferences2 ${theme === "light" ? "preferences2-light" : "preferences2-dark"}`} >
                    <p>Preference</p>
                    <div className={`choice ${theme === "light" ? "choice-light" : "choice-dark"}`} onClick={toggleTheme}>
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
                <div className="box1">
                    <MainCard title={"Weather Station"}>
                        <div className='weather-station-card'>
                            <ChildCard>
                                <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", rowGap: "40px", paddingTop: "10px" }}>
                                    <NewCompass size={getCompassSize()} needle1={response?.weather?.heading} needle2={response?.weather?.windAngle} />
                                    <div className='weather-station-chips'>
                                        <StatusChip color={"blue"} description={"Wind Angle"} />
                                        <StatusChip color={"red"} description={"Aerostat Heading"} />
                                    </div>
                                </div>
                            </ChildCard>
                        </div>
                    </MainCard>
                    <MainCard title={"Wind Speed"}>
                        <div className='wind-speed-card'>
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={windGaugeOptions(theme, 0, 70, [response?.weather?.windSpeed], getChartSize())}
                            />
                            <ChartsData position={"between"} description1={"Air Temp (C):"} value1={response?.weather?.airTemp} description2={"Baro Press (inHg):"} value2={response?.weather?.baroPres} graphValue={response?.weather?.windSpeed}
                                graphName={"Wind Speed"} />
                        </div>
                    </MainCard>
                    <MainCard title={"Controls"}>
                        <div className={`controls-box ${theme === "light" ? "controls-box-light" : "controls-box-dark"}`}>
                            <h2>Fan Control</h2>
                            <div className={`fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"}`}>
                                <p>Fan 1 <span>(Left direction)</span></p>
                                <OptionBox fetchingStart={fetchingStart} handleChange={handleChange} name="fan1" option1={"Continuous"} option2={"Pressured"} selectedOption={fan1} />
                            </div>
                            <div className={`fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"}`}>
                                <p>Fan 2 <span>(Right direction)</span></p>
                                <OptionBox fetchingStart={fetchingStart} handleChange={handleChange} name="fan2" option1={"Continuous"} option2={"Pressured"} selectedOption={fan2} />
                            </div>
                            <h2>Light Control</h2>
                            <div className={`fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"}`}>
                                <p>Strobe Control</p>
                                <OptionBox fetchingStart={fetchingStart} handleChange={handleChange} name="strobe" option1={"Continuous"} option2={"Off"} selectedOption={strobe} />
                            </div>
                            <div className={`fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"}`}>
                                <p>Position Control</p>
                                <OptionBox fetchingStart={fetchingStart} handleChange={handleChange} name="position" option1={"Continuous"} option2={"Off"} selectedOption={position} />
                            </div>
                        </div>
                    </MainCard>
                </div>
                <div className="box2">
                    <div className={`preferences ${theme === "light" ? "preferences-light" : "preferences-dark"}`} >
                        <p>Preference</p>
                        <div className={`choice ${theme === "light" ? "choice-light" : "choice-dark"}`} onClick={toggleTheme}>
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
                                        <ChartChip name={"Heading"} value={response?.digitalCompass?.Magheading} />
                                        <NewCompass size={getCompassSize()} needle1={response?.digitalCompass?.Magheading} />
                                    </div>
                                </ChildCard>
                            </div>
                            <div className="heading-box2">
                                <ChildCard>
                                    <div className="pitch-box-content">
                                        <div className='pitch-roll-chips'>
                                            <ChartChip name={"Roll:"} value={response?.digitalCompass?.Roll} />
                                            <ChartChip name={"Pitch:"} value={response?.digitalCompass?.Pitch} />
                                        </div>
                                        <NewRollMeter roll={response?.digitalCompass?.Roll} pitch={response?.digitalCompass?.Pitch} />
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
                                            options={pressureGaugeOptions(theme, 0, 6, [response?.helium?.HelPressure], getChartSize())}
                                        />
                                        <ChartsData position={"around"} graphValue={response?.helium?.HelPressure} graphName={"Hull Helium"} />
                                    </div>
                                    <div>
                                        <HighchartsReact
                                            highcharts={Highcharts}
                                            options={pressureGaugeOptions(theme, 0, 6, [response?.ballonet?.BalPressure], getChartSize())}
                                        />
                                        <ChartsData position={"around"} graphValue={response?.ballonet?.BalPressure} graphName={"Ballonet Air"} />
                                    </div>
                                </div>
                            </MainCard>
                        </div>
                        <div className="confluence-box">
                            <MainCard title={"Confluence Point Tension"}>
                                <div className="confluence-box-content">
                                    <ChartChip name={"Max Tension"} value={response?.adams?.MaxTension} />
                                    <div className='confluence-graph'>
                                        <HighchartsReact
                                            highcharts={Highcharts}
                                            options={confluenceGaugeOptions(theme, 0, 700, [response?.adams?.Tension], getChartSize())}
                                        />
                                        <ChartsData position={"center"} graphName={"Current Tension"} graphValue={response?.adams?.Tension} />
                                    </div>
                                </div>
                            </MainCard>
                        </div>
                    </div>
                    <div className="horizontal-box2">
                        <div className="radio-box">
                            <MainCard title={"Radio Link"}>
                                <div className='radio-box-content'>
                                    <div className={`config-box ${theme === "light" ? "config-box-light" : "config-box-dark"}`}>
                                        <div className={`log-detail ${theme === "light" ? "log-detail-light" : "log-detail-dark"}`}>
                                            <p>RF Link:</p>
                                            <StatusChip color={"green"} description={"Connected"} />
                                        </div>
                                        <div className={`loading-bar ${theme === "light" ? "loading-bar-light" : "loading-bar-dark"}`}>
                                            <div className="progress"></div>
                                        </div>
                                        <div className={`log-detail ${theme === "light" ? "log-detail-light" : "log-detail-dark"}`}>
                                            <p>Tether Link:</p>
                                            <StatusChip color={"green"} description={!fetchingStart ? "Disconnected" : isLoading ? isLoading : "Disconnected"} />
                                        </div>
                                        <div className={`loading-bar ${theme === "light" ? "loading-bar-light" : "loading-bar-dark"}`}>
                                            <div className="progress" style={{ backgroundColor: !fetchingStart || !isLoading || isLoading === "Disconnected" ? "red" : "" }}></div>
                                        </div>
                                        <button onClick={handleOpenModal} className={!playBtn && StopBtn && fwdBtn || !playBtn && !fwdBtn && StopBtn ? "disable" : ""}>Configure</button>

                                    </div>
                                    <div className={`config-details ${theme === "light" ? "config-details-light" : "config-details-dark"}`}>
                                        <h1>Details</h1>
                                        <div className={`config-details-items ${theme === "light" ? "config-details-items-light" : "config-details-items-dark"}`}>
                                            <div>
                                                <p>GCS Address</p>
                                                <div className={`config-info ${theme === "light" ? "config-info-light" : "config-info-dark"}`}>
                                                    <p>{form?.ip}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p>Weather Station Port</p>
                                                <div className={`config-info ${theme === "light" ? "config-info-light" : "config-info-dark"}`}>
                                                    <p>{form?.weather}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p>HMR Port  </p>
                                                <div className={`config-info ${theme === "light" ? "config-info-light" : "config-info-dark"}`}>
                                                    <p>{form?.hmr}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p>Ballonet Pressure Port</p>
                                                <div className={`config-info ${theme === "light" ? "config-info-light" : "config-info-dark"}`}>
                                                    <p>{form?.ballonet}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p>Helium Pressure Port</p>
                                                <div className={`config-info ${theme === "light" ? "config-info-light" : "config-info-dark"}`}>
                                                    <p>{form?.helium}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p>ADAM Port</p>
                                                <div className={`config-info ${theme === "light" ? "config-info-light" : "config-info-dark"}`}>
                                                    <p>{form?.adam}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p>EBox Port</p>
                                                <div className={`config-info ${theme === "light" ? "config-info-light" : "config-info-dark"}`}>
                                                    <p>{form?.ebox}</p>
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
                                    <div className={`log-input-box ${theme === "light" ? "log-input-box-light" : "log-input-box-dark"}`}>
                                        <p>Log File</p>
                                        <div className={`file-name-box ${theme === "light" ? "file-name-box-light" : "file-name-box-dark"}`}>{fileName ? fileName : ""}</div>
                                        <input
                                            type="file"
                                            id="fileInput"
                                            style={{ display: 'none' }}
                                            onChange={HandleBrowse}
                                            disabled={!playBtn && StopBtn ? true : false}
                                        />
                                        <label htmlFor="fileInput" className={`custom-file-input ${theme} ${!playBtn && StopBtn ? "disable" : ""}`}>
                                            Browse
                                        </label>
                                    </div>
                                    <div className="button-groups">
                                        <div className={`tdbutton ${theme === "light" ? "td-light" : "td-dark"}`}>
                                            <button className={`upper-part ${!playBtn ? "disable" : ""}`} onClick={HandlePlay}>
                                                <img src={play} alt="" />
                                            </button>
                                        </div>
                                        <div className={`tdbutton ${theme === "light" ? "td-light" : "td-dark"}`}>
                                            <button className={`upper-part ${!fwdBtn ? "disable" : ""}`} onClick={HandleForward}>
                                                <img src={forward} alt="" />
                                            </button>
                                        </div>
                                        <div className={`tdbutton ${theme === "light" ? "td-light" : "td-dark"}`}>
                                            <button className={`upper-part ${!StopBtn ? "disable" : ""}`} onClick={HandleStop}>
                                                <img src={stop} alt="" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </MainCard>
                        </div>
                    </div>
                </div>


            </div>
            <Modal
                theme={theme}
                open={openModal}
                handleClose={() => setOpenModal(false)}
                handleSubmit={handleSubmit}
                form={form}
                setForm={setForm}
                errorValues={errorValues}
                setErrorValues={setErrorValues}
            />
        </>
    )
}

export default Home
