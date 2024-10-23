import React, { useContext } from 'react'
import { ThemeContext } from '../ThemeHandler';

const ChartChip = ({ name, value, unit }) => {
    const { theme } = useContext(ThemeContext);

    return (
        <div className={`chart-chip ${theme === "light" ? "chart-chip-light" : "chart-chip-dark"}`}>
            <p>{name}</p>
            <div>
                <p>{value}{" "} {unit && unit}</p>
            </div>
        </div>
    )
}

export default ChartChip
