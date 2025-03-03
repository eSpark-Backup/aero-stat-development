import React, { useState } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import MainCard from "../../common/MainCard";
import { useTranslation } from "react-i18next";

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

const LineChartWithDropdown = ({ theme, data }) => {
  const [selectedValues, setSelectedValues] = useState(availableOptions);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { t } = useTranslation();

  console.log("Received data in Chart Component:", data);

  const toggleSelection = (option) => {
    setSelectedValues((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const formatChartData = () =>
    selectedValues.map((metric) => ({
      name: metric,
      data: data[metric] || [],
      color: colorMap[metric] || "#000000",
    }));

  const getYAxisRange = () => {
    const maxDataValue = Math.max(
      ...selectedValues.flatMap((metric) => data[metric] || [])
    );

    let maxYAxis;
    if (maxDataValue > 1000) {
      maxYAxis = 1500;
    } else if (maxDataValue > 800) {
      maxYAxis = 1200;
    } else if (maxDataValue > 500) {
      maxYAxis = 800;
    } else if (maxDataValue > 200) {
      maxYAxis = 500;
    } else {
      maxYAxis = Math.max(maxDataValue * 1.2, 10);
    }

    return { min: 0, max: maxYAxis };
  };

  const lineChartOptions = {
    chart: {
      type: "line",
      backgroundColor: "transparent",
      zooming: { type: "xy" }, // Enables zooming on both axes
      panning: { enabled: true, type: "xy" }, // Enables panning
      panKey: "shift", // Hold shift to enable panning
    },
    title: { text: `Hull Pressure Over Time` },
    xAxis: {
      categories:
        data[selectedValues[0]]?.map((_, i) => `Point ${i + 1}`) || [],
      min: 0, // Ensures panning works properly
    },
    yAxis: {
      title: { text: "Values" },
      ...getYAxisRange(),
    },
    series: formatChartData(),
    tooltip: { shared: true, crosshairs: true }, // Enhances the tooltip experience
    credits: { enabled: false }, // Hides the Highcharts watermark
    legend: { enabled: true },
    accessibility: { enabled: false },
  };

  return (
    <div className="chart-container">
      <div className="dropdown-wrapper">
        <button
          className="dropdown-button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {t("select")}
        </button>
        {dropdownOpen && (
          <div className="dropdown-menu">
            {availableOptions.map((option) => (
              <label key={option} className="dropdown-item">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => toggleSelection(option)}
                />
                {option}
              </label>
            ))}
          </div>
        )}
      </div>
      <MainCard title={t("lineChart")}>
        <HighchartsReact highcharts={Highcharts} options={lineChartOptions} />
      </MainCard>
      <style>
        {`
        .chart-container {
          position: relative;
          margin-bottom: 20px;
          width: 80%;
          background: #eff2f7;
          border-radius: 12px;
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
        `}
      </style>
    </div>
  );
};

export default LineChartWithDropdown;
