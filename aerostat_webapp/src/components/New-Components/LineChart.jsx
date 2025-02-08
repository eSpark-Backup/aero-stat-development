import React, { useEffect, useState } from "react";
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
  data,
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

  const filteredData =
    (phase === 1 && !isPhase1Starts) || (phase === 2 && !isPhase2Starts)
      ? [0.4] // Default when conditions are met
      : data; // Otherwise, use actual data
  

  // Format chart data for Highcharts
  const formatChartData = (selectedValues, data) => {
    return selectedValues.map((value, index) => {
      const seriesData = data.find((item) => item.name === value)?.data || [0, 0, 0];
      return {
        name: value,
        data: seriesData,
        color: theme?.[value] || ["red", "blue", "green", "purple", "orange"][index],
      };
    });
  };

  const lineChartOptions = {
    chart: { type: "line", backgroundColor: "transparent" },
    title: { text: "Hull Helium Over Time" },
    xAxis: { categories: ["Point 1", "Point 2", "Point 3"] },
    yAxis: { title: { text: "Hull Helium" }, min: 0, max: 3 },
    series: formatChartData(selectedValues, filteredData),
  };

  return (
    <div className="chart-container">
      {/* Dropdown for selecting values */}
      <div className="dropdown-wrapper">
        <button className="dropdown-button" onClick={() => setDropdownOpen(!dropdownOpen)}>
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

      {/* Highcharts Graph inside MainCard */}
      <MainCard title={"Line Charts"}>
        <HighchartsReact highcharts={Highcharts} options={lineChartOptions} />
      </MainCard>

      {/* Styles */}
      <style>{`
        .chart-container {
          position: relative;
        }
        .dropdown-wrapper {
          position: absolute;
          top: 25px; /* Moves it above the chart */
          left: 10px;
          z-index: 1000; /* Ensures dropdown stays above other elements */
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
          background: ${theme?.menuBackground || "#fff"};
          color: ${theme?.menuText || "black"};
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
    </div>
  );
};

export default LineChartWithDropdown;
