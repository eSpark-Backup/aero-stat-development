import React, { useContext } from 'react'
import { ThemeContext } from '../ThemeHandler';

const OptionBox = ({ option1, option2, selectedOption, handleChange, name, fetchingStart, phase }) => {
    const { theme, isPhase1Starts, isPhase2Starts } = useContext(ThemeContext);

    return (
        <div className={`option-box ${theme === "light" ? "option-box-light" : "option-box-dark"}`}>
            <div
                onClick={() => handleChange(name, option1)}
                className={`${selectedOption?.toLowerCase() === option1.toLowerCase() ? "selected" : "not-selected"
                    } ${(phase === 1 && !isPhase1Starts) || (phase === 2 && !isPhase2Starts) ? "" : ""}`}
            >
                {option1}
            </div>
            <div className={theme === "light" ? "breaker-light" : "breaker-dark"}><p>|</p></div>
            <div
                onClick={() => handleChange(name, option2)}
                className={`${selectedOption?.toLowerCase() === option2.toLowerCase() ? "selected" : "not-selected"
                    } ${(phase === 1 && !isPhase1Starts) || (phase === 2 && !isPhase2Starts) ? "" : ""}`}
            >
                {option2}
            </div>
        </div>
    )
}

export default OptionBox
