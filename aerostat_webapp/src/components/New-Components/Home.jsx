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
import { useWindowWidth, fetchDataUtil } from '../../utils'
import Modal from '../Modal'
import { formatDateTime } from '../../Js_parsing'

HighchartsMore(Highcharts);
HighchartsGauge(Highcharts);

const Home = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const width = useWindowWidth();
    const getChartSize = () => (width >= 1280 && width <= 1440) ? 200 : 260
    const getCompassSize = () => (width >= 1280 && width <= 1440) ? true : false;
    const [openModal, setOpenModal] = useState(false);
    const [isLoading, setIsLoading] = useState(1);
    const [form, setForm] = useState({
        ip: "192.168.100.5",
        weather: "4002",
        hmr: "4003",
        ballonet: "4004",
        helium: "4005",
        adam: "4006",
        ebox: "4007",
    });
    const [startFetchingFromFile, setStartFetchingFromFile] = useState(false);

    const lastPerfectResponses = useRef({
        adams: { MaxTension: 700, Tension: 0 },
        ballonet: { BalPressure: 0.071 },
        digitalCompass: { Magheading: 240.1, Pitch: 6, Roll: 6 },
        ebox: { InternalTemp: 25.5, fan1: 'ON', fan2: 'ON', position: '1', strobe: 'OFF' },
        helium: { HelPressure: -0.398 },
        weather: { airTemp: 18.8, baroPres: 29.3, heading: 128, windAngle: 158.4, windSpeed: 70 }
    });

    const [responses, setResponses] = useState(lastPerfectResponses.current);

    const fetchData = async () => {
        try {
            const results = await fetchDataUtil();
            const parsedResponses = {
                weather: results.port_4002 || lastPerfectResponses.current.weather,
                digitalCompass: results.port_4003 || lastPerfectResponses.current.digitalCompass,
                ballonet: results.port_4004 || lastPerfectResponses.current.ballonet,
                helium: results.port_4005 || lastPerfectResponses.current.helium,
                adams: results.port_4006 || lastPerfectResponses.current.adams,
                ebox: results.port_4007 || lastPerfectResponses.current.ebox,
                time: formatDateTime(),
            };
            lastPerfectResponses.current = {
                ...lastPerfectResponses.current,
                weather: parsedResponses.weather,
                digitalCompass: parsedResponses.digitalCompass,
                ballonet: parsedResponses.ballonet,
                helium: parsedResponses.helium,
                adams: parsedResponses.adams,
                ebox: parsedResponses.ebox,
            };
            if (Object.keys(results).length > 0) {
                setIsLoading(0);
            }
            else {
                setIsLoading(2);
            }
            setResponses(parsedResponses);
        } catch (error) {
            setIsLoading(2);
            console.error("Error in fetchData:", error);
        }
    };

    useEffect(() => {
        if (!startFetchingFromFile) {
            fetchData();
            const interval = setInterval(fetchData, 1000);
            return () => clearInterval(interval);
        }
    }, [startFetchingFromFile]);
    const [errorValues, setErrorValues] = useState([]);


    const handleSubmit = async () => {
        const errors = [];


        const ipRegex = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;

        Object.keys(form).forEach(key => {
            if (form[key].trim() === "") {
                errors.push(key);
            }
        });


        if (form.ip && !ipRegex.test(form.ip.trim())) {
            errors.push('ip');
        }

        setErrorValues(errors);
        if (errors.length > 0) {
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/update-config", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(form),
            })
            if (response.ok) {
                const result = await response.json();
                console.log("Form successfully posted:");
                setOpenModal(false);
                setErrorValues([]);
                setForm({
                    ip: "",
                    weather: "",
                    hmr: "",
                    ballonet: "",
                    helium: "",
                    adam: "",
                    ebox: "",
                })
                // setStartFetchingFromFile(false);
                // setFwdBtn(false);
                // setPlayBtn(false);
                // setHeaderText("LIVE DATA");
                // setFileContent("");
                // setLogFile("");
                // setStopBtn(false)
                // setFetchingSpeed(1000);
            }
        } catch (error) {
            console.log("Error in form posting:", error);
            setOpenModal(false);
            setErrorValues([]);
            setForm({
                ip: "",
                weather: "",
                hmr: "",
                ballonet: "",
                helium: "",
                adam: "",
                ebox: "",
            })
        }
    };


    const [fan1, setFan1] = useState(responses?.ebox?.fan1 === "ON" ? "Continuous" : responses?.ebox?.fan1 === "OFF" ? "Pressured" : "Continuous");
    const [fan2, setFan2] = useState(responses?.ebox?.fan2 === "ON" ? "Continuous" : responses?.ebox?.fan2 === "OFF" ? "Pressured" : "Continuous");
    const [position, setPosition] = useState(responses?.ebox?.position === "1" ? "Continuous" : responses?.ebox?.position === "0" ? "Off" : "Off");
    const [strobe, setStrobe] = useState(responses?.ebox?.strobe === "ON" ? "Continuous" : responses?.ebox?.strobe === "OFF" ? "Off" : "Continuous");


    useEffect(() => {
        // if (responses) {
        console.log(responses)
        // }
    }, [responses])
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
                                    <NewCompass size={getCompassSize()} needle1={responses?.weather?.heading} needle2={responses?.weather?.windAngle} />
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
                                options={windGaugeOptions(theme, 0, 70, [responses?.weather?.windSpeed], getChartSize())}
                            />
                            <ChartsData position={"between"} description1={"Air Temp (C):"} value1={responses?.weather?.airTemp} description2={"Baro Press (inHg):"} value2={responses?.weather?.baroPres} graphValue={responses?.weather?.windSpeed}
                                graphName={"Wind Speed"} />
                        </div>
                    </MainCard>
                    <MainCard title={"Controls"}>
                        <div className={`controls-box ${theme === "light" ? "controls-box-light" : "controls-box-dark"}`}>
                            <h2>Fan Control</h2>
                            <div className={`fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"}`}>
                                <p>Fan 1 <span>(Left direction)</span></p>
                                <OptionBox setSelectedOption={setFan1} option1={"Continuous"} option2={"Pressured"} selectedOption={fan1} />
                            </div>
                            <div className={`fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"}`}>
                                <p>Fan 2 <span>(Right direction)</span></p>
                                <OptionBox setSelectedOption={setFan2} option1={"Continuous"} option2={"Pressured"} selectedOption={fan2} />
                            </div>
                            <h2>Lights Control</h2>
                            <div className={`fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"}`}>
                                <p>Strobe Control</p>
                                <OptionBox setSelectedOption={setStrobe} option1={"Continuous"} option2={"Off"} selectedOption={strobe} />
                            </div>
                            <div className={`fan-box ${theme === "light" ? "fan-box-light" : "fan-box-dark"}`}>
                                <p>Position Control</p>
                                <OptionBox setSelectedOption={setPosition} option1={"Continuous"} option2={"Off"} selectedOption={position} />
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
                                        <ChartChip name={"Heading"} value={responses?.digitalCompass?.Magheading} />
                                        <NewCompass size={getCompassSize()} needle1={responses?.digitalCompass?.Magheading} />
                                    </div>
                                </ChildCard>
                            </div>
                            <div className="heading-box2">
                                <ChildCard>
                                    <div className="pitch-box-content">
                                        <div className='pitch-roll-chips'>
                                            <ChartChip name={"Roll:"} value={responses?.digitalCompass?.Roll} />
                                            <ChartChip name={"Pitch:"} value={responses?.digitalCompass?.Pitch} />
                                        </div>
                                        <NewRollMeter roll={responses?.digitalCompass?.Roll} pitch={responses?.digitalCompass?.Pitch} />
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
                                            options={pressureGaugeOptions(theme, 0, 6, [responses?.helium?.HelPressure], getChartSize())}
                                        />
                                        <ChartsData position={"around"} graphValue={responses?.helium?.HelPressure} graphName={"Hull Helium"} />
                                    </div>
                                    <div>
                                        <HighchartsReact
                                            highcharts={Highcharts}
                                            options={pressureGaugeOptions(theme, 0, 6, [responses?.ballonet?.BalPressure], getChartSize())}
                                        />
                                        <ChartsData position={"around"} graphValue={responses?.ballonet?.BalPressure} graphName={"Ballonet Air"} />
                                    </div>
                                </div>
                            </MainCard>
                        </div>
                        <div className="confluence-box">
                            <MainCard title={"Confluence Point Tension"}>
                                <div className="confluence-box-content">
                                    <ChartChip name={"Max Tension"} value={responses?.adams?.MaxTension} />
                                    <div className='confluence-graph'>
                                        <HighchartsReact
                                            highcharts={Highcharts}
                                            options={confluenceGaugeOptions(theme, 0, 700, [responses?.adams?.Tension], getChartSize())}
                                        />
                                        <ChartsData position={"center"} graphName={"Current Tension"} graphValue={responses?.adams?.Tension} />
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
                                            <StatusChip color={"green"} description={isLoading === 2 ? "Disconnected" : isLoading === 1 ? "Loading..." : "Connected"} />
                                        </div>
                                        <div className={`loading-bar ${theme === "light" ? "loading-bar-light" : "loading-bar-dark"}`}>
                                            <div className="progress"></div>
                                        </div>
                                        <div className={`log-detail ${theme === "light" ? "log-detail-light" : "log-detail-dark"}`}>
                                            <p>Tether Link:</p>
                                            <StatusChip color={"green"} description={"Connected"} />
                                        </div>
                                        <div className={`loading-bar ${theme === "light" ? "loading-bar-light" : "loading-bar-dark"}`}>
                                            <div className="progress"></div>
                                        </div>
                                        <button onClick={() => setOpenModal(true)}>Config</button>

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
                                        <div className={`file-name-box ${theme === "light" ? "file-name-box-light" : "file-name-box-dark"}`}>Aero/Nw7/Fgs/70082024</div>
                                        <button>Browse</button>
                                    </div>
                                    <div className="button-groups">
                                        <div className={`tdbutton ${theme === "light" ? "td-light" : "td-dark"}`}>
                                            <div className="upper-part">
                                                <img src={play} alt="" />
                                            </div>
                                        </div>
                                        <div className={`tdbutton ${theme === "light" ? "td-light" : "td-dark"}`}>
                                            <div className="upper-part">
                                                <img src={forward} alt="" />
                                            </div>
                                        </div>
                                        <div className={`tdbutton ${theme === "light" ? "td-light" : "td-dark"}`}>
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
