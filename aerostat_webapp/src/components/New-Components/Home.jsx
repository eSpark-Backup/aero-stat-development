import React from 'react'
import MainCard from '../../common/MainCard'
import ChildCard from '../../common/ChildCard'
import StatusChip from '../../common/StatusChip'
import NewCompass from './NewCompass'

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
            </div>
            <div className="box2"></div>
        </div>
    )
}

export default Home
