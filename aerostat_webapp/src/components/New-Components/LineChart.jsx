import React, { useState } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import MainCard from "../../common/MainCard";

const availableOptions = [
  "Barometric Pressure",
  "Hull Pressure",
  "Ballonet Pressure",
  "Ballonet Curtain",
  "Outside Temperature",
];

const LineChartWithDropdown = ({
  theme,
  phase,
  isPhase1Starts,
  isPhase2Starts,
  data, // Changed from dataPoints to data
}) => {
  const [selectedValues, setSelectedValues] = useState(availableOptions);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSelectionChange = (value) => {
    setSelectedValues((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  // Ensure data is correctly formatted
  const filteredData =
    (phase === 1 && !isPhase1Starts) || (phase === 2 && !isPhase2Starts)
      ? [0.4] // Default when conditions are met
      : data; // Otherwise, use actual data

  const lineChartOptions = (theme, data) => ({
    chart: {
      type: "line",
      backgroundColor: "transparent",
    },
    title: { text: "Hull Helium Over Time" },
    xAxis: { categories: ["Point 1", "Point 2", "Point 3"] },
    yAxis: {
      title: {
        text: "Hull Helium",
        align: "middle",
        rotation: 270,
        y: 0,
        x: -10,
        style: { color: "#000", fontSize: "14px", fontWeight: "bold" },
      },
      gridLineColor: "#D3DAE6",
      labels: {
        style: { color: "#000", fontSize: "12px" },
      },
    },
    series: selectedValues.map((value, index) => ({
      name: value,
      data: data?.[value] ?? [0, 0, 0], // Ensure default array if data is missing
      color:
        theme?.[value] || ["red", "blue", "green", "purple", "orange"][index],
    })),
  });

  return (
    <MainCard title={"Line Charts"}>
      {/* Dropdown for selecting values */}
      <div className="dropdown">
        <button
          className="dropdown-button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          Select Data Points ⏷
        </button>
        {dropdownOpen && (
          <div className="dropdown-menu">
            {availableOptions.map((option) => (
              <label key={option} className="dropdown-item">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => handleSelectionChange(option)}
                />
                {option}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Highcharts Graph */}
      <HighchartsReact
        highcharts={Highcharts}
        options={lineChartOptions(theme, filteredData)}
      />

      {/* Styles */}
      <style>{`
  .dropdown {
    position: relative;
    display: inline-block;
    margin-bottom: 10px;
  }
  .dropdown-button {
    padding: 8px 12px;
    background: ${theme?.buttonBackground || "#007bff"};
    color: ${theme?.buttonText || "white"};
    border: none;
    cursor: pointer;
    border-radius: 4px;
  }
  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background: ${
      theme?.menuBackground || "#fff"
    }; /* Ensure dark background */
    color: ${theme?.menuText || "Black"};
    border: 1px solid ${theme?.menuBorder || "#555"};
    box-shadow: 2px 2px 10px rgba(0,0,0,0.3);
    padding: 5px;
    z-index: 10;
  }
  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px;
  }
  .dropdown-item input {
    margin-right: 5px;
  }
`}</style>
    </MainCard>
  );
};

export default LineChartWithDropdown;
