import React from 'react'

const StatusChip = ({ color, description }) => {
    return (
        <div className='status-chip'>
            <div className={`status ${color === "red" || color === "blue" || color === "green" ? color : ""}`}></div>
            <div className={`status-desc ${color === "red" || color === "blue" || color === "green" ? color + "-text" : ""}`}>
                <p>{description}</p>
            </div>
        </div>
    )
}

export default StatusChip
