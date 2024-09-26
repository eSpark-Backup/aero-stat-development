import React from 'react'

const ChartChip = ({ name, value }) => {
    return (
        <div className='chart-chip'>
            <p>{name}</p>
            <div>
                <p>{value}</p>
            </div>
        </div>
    )
}

export default ChartChip
