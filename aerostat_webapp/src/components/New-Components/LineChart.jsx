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

const LineChartWithDropdown = ({ theme, response }) => {
  const [selectedValues, setSelectedValues] = useState(availableOptions);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Initialize Data for All Available Options
  const [dataPoints, setDataPoints] = useState(
    availableOptions.map((option) => ({ name: option, data: [] }))
  );

  // Handle WebSocket Response Update
  useEffect(() => {
    if (response) {
      setDataPoints((prevDataPoints) => {
        return prevDataPoints.map((item) => {
          const newValue =
            parseFloat(
              response?.helium?.[item.name.toLowerCase().replace(/\s+/g, "_")]
            ) || 0;

          return {
            ...item,
            data: [...item.data, newValue].slice(-10), // Keep last 10 points
          };
        });
      });
    }
  }, [response]);

  // Format chart data for Highcharts
  const formatChartData = () => {
    return selectedValues.map((value, index) => {
      const seriesData =
        dataPoints.find((item) => item.name === value)?.data || [];
      return {
        name: value,
        data: seriesData,
        color:
          theme?.[value] || ["red", "blue", "green", "purple", "orange"][index],
      };
    });
  };

  const lineChartOptions = {
    chart: { type: "line", backgroundColor: "transparent" },
    title: { text: "Hull Helium Over Time" },
    xAxis: {
      categories: dataPoints[0]?.data.map((_, i) => `Point ${i + 1}`) || [],
    },
    yAxis: { title: { text: "Hulll Helium" }, min: 0, max: 3 },
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

      {/* Highcharts Graph inside MainCard */}
      <MainCard title={"Line Chart"}>
        <HighchartsReact
          key={JSON.stringify(lineChartOptions.series)} // Forces re-render on data update
          highcharts={Highcharts}
          options={lineChartOptions}
        />
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
