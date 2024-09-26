import React from 'react'

const ChartsData = ({ position }) => {
    return (
        <div className={position === "between" ? 'charts-data-box' : position === "around" ? 'charts-data-box2' : 'charts-data-box3'
        }>
            {
                position === "between"
                &&
                <div className="charts-data-between">
                    <div className='box-values'>
                        <p>Air Temp (C): <span>15</span></p>
                        <p>Bare Press (inHg): <span>292</span></p>
                    </div>
                    <div className="chart-value">
                        <h2>0.295</h2>
                        <p>Wind Speed</p>
                    </div>
                </div>
            }

            {
                position === "around"
                &&
                <div className="charts-data-around">
                    <p>-ve side</p>
                    <div>
                        <h2>0.295</h2>
                        <p>Hull Helium</p>
                    </div>
                    <p>-ve side</p>
                </div>
            }
            {
                position === "center"
                &&
                <div className="charts-data-center">
                    <h2>1</h2>
                    <p>Current Tension</p>
                </div>
            }
        </div >
    )
}

export default ChartsData
