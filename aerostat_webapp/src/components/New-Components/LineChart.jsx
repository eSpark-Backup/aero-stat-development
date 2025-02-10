import React, { useState } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import MainCard from "../../common/MainCard";

const availableOptions = [
  "Hull Pressure",
  "Barometric Pressure",
  "Outside Temperature",
  "Ballonet Pressure",
  "Ballonet Curtain",
];

const colorMap = {
  "Hull Pressure": "#ff5733",
  "Barometric Pressure": "#33ff57",
  "Outside Temperature": "#3357ff",
  "Ballonet Pressure": "#ff33a8",
  "Ballonet Curtain": "#ffcc33",
};

const yAxisRanges = {
  "Hull Pressure": { min: 0, max: 6 },
  "Barometric Pressure": { min: 0, max: 1500 },
  "Outside Temperature": { min: 0, max: 50 },
  "Ballonet Pressure": { min: 0, max: 6 },
  "Ballonet Curtain": { min: 0, max: 12 },
};

const LineChartWithDropdown = ({ theme, data }) => {
  const [selectedValue, setSelectedValue] = useState("Hull Pressure");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  console.log("Received data in Chart Component:", data);

  const formatChartData = () => [
    {
      name: selectedValue,
      data: data[selectedValue] || [],
      color: colorMap[selectedValue] || "#000000",
    },
  ];

  const getYAxisRange = () => yAxisRanges[selectedValue] || { min: 0, max: 10 };

  const lineChartOptions = {
    chart: { type: "line", backgroundColor: "transparent" },
    title: { text: `${selectedValue} Over Time` },
    xAxis: {
      categories: data[selectedValue]?.map((_, i) => `Point ${i + 1}`) || [],
    },
    yAxis: {
      title: { text: selectedValue },
      ...getYAxisRange(),
    },
    series: formatChartData(),
  };

  return (
    <div className="chart-container">
      <div className="dropdown-wrapper">
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
                  type="radio"
                  checked={selectedValue === option}
                  onChange={() => setSelectedValue(option)}
                />
                {option}
              </label>
            ))}
          </div>
        )}
      </div>
      <MainCard title={"Line Chart"}>
        <HighchartsReact highcharts={Highcharts} options={lineChartOptions} />
      </MainCard>
      <style>{`
        .chart-container {
          position: relative;
        }
        .dropdown-wrapper {
          position: absolute;
          top: 25px;
          left: 10px;
          z-index: 1000;
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
