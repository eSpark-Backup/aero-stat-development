import React, { useContext } from 'react'
import { ThemeContext } from '../ThemeHandler';

const OptionBox = ({ option1, option2, selectedOption }) => {
    const { theme } = useContext(ThemeContext);

    return (
        <div className={`option-box ${theme === "light" ? "option-box-light" : "option-box-dark"}`}>
            <div className={selectedOption.toLowerCase() === option1.toLowerCase() ? "selected" : "not-selected"}>{option1}</div>
            <div className={theme === "light" ? "breaker-light" : "breaker-dark"}><p>|</p></div>
            <div className={selectedOption.toLowerCase() === option2.toLowerCase() ? "selected" : "not-selected"}>{option2}</div>
        </div>
    )
}

export default OptionBox
