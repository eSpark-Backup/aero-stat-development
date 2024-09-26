import React from 'react'

const OptionBox = ({ option1, option2, selectedOption }) => {
    return (
        <div className='option-box'>
            <div className={selectedOption.toLowerCase() === option1.toLowerCase() ? "selected" : "not-selected"}>{option1}</div>
            <div className="breaker">|</div>
            <div className={selectedOption.toLowerCase() === option2.toLowerCase() ? "selected" : "not-selected"}>{option2}</div>
        </div>
    )
}

export default OptionBox
