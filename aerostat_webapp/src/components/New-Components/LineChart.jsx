import React, { useEffect, useState } from "react";
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

const LineChartWithDropdown = ({ theme, data }) => {
  const [selectedValues, setSelectedValues] = useState(availableOptions);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  console.log("Received data in Chart Component:", data); // ✅ Debug received data
  console.log("Formatted Chart Data:", formatChartData()); // ✅ Debug formatted data

  // Format chart data for Highcharts
  const formatChartData = () => {
    return selectedValues.map((value, index) => ({
      name: value,
      data: data[value] || [], // ✅ Fix: Use data directly from props
      color:
        theme?.[value] || ["red", "blue", "green", "purple", "orange"][index],
    }));
  };

  const lineChartOptions = {
    chart: { type: "line", backgroundColor: "transparent" },
    title: { text: "Hull Helium Over Time" },
    xAxis: {
      categories: data["Hull Pressure"]?.map((_, i) => `Point ${i + 1}`) || [],
    },
    yAxis: { title: { text: "Hull Helium" }, min: 0, max: 3 },
    series: formatChartData(),
  };

  return (
    <div className="chart-container">
      {/* Dropdown for selecting values */}
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
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() =>
                    setSelectedValues((prev) =>
                      prev.includes(option)
                        ? prev.filter((item) => item !== option)
                        : [...prev, option]
                    )
                  }
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
