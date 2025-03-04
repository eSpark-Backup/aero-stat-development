import React, { useContext } from "react";
import { ThemeContext } from "../ThemeHandler";

const ChartsData = ({
  position,
  description1,
  description2,
  description3,
  value1,
  value2,
  value3,
  graphValue,
  graphName,
  unit,
  graphValueStyle = {}, // Accept custom styles
  graphNameStyle = {}, // Accept custom styles for name
  graphBgStyle = {},
  chartsDataBg = {},
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      style={chartsDataBg}
      className={
        position === "between" && theme === "light"
          ? "charts-data-box-light"
          : position === "between" && theme === "dark"
          ? "charts-data-box-dark"
          : position === "around" && theme === "light"
          ? "charts-data-box2-light"
          : position === "around" && theme === "dark"
          ? "charts-data-box2-dark"
          : position === "center" && theme === "light"
          ? "charts-data-box3-light"
          : "charts-data-box3-dark"
      }
    >
      {position === "between" && (
        <div style={graphBgStyle} className="charts-data-between">
          <div
            className={`box-values ${
              theme === "light" ? "box-values-light" : "box-values-dark"
            }`}
          >
            <p>
              {description1} <span>{value1}</span>
            </p>
            <p>
              {description2} <span>{value2}</span>
            </p>
            <p>
              {description3} <span>{value3}</span>
            </p>
          </div>
          <div
            className={`chart-value ${
              theme === "light" ? "chart-value-light" : "chart-value-dark"
            }`}
          >
            <h2 style={graphValueStyle}>
              {graphValue}{" "}
              <span style={{ fontSize: "16px" }}>{unit && unit}</span>
            </h2>
            <p style={graphNameStyle}>{graphName}</p>
          </div>
        </div>
      )}

      {position === "around" && (
        <div
          className={`charts-data-around ${
            theme === "light"
              ? "charts-data-around-light"
              : "charts-data-around-dark"
          }`}
        >
          <div>
            <h2 style={graphValueStyle}>
              {graphValue}{" "}
              <span style={{ fontSize: "16px" }}>{unit && unit}</span>
            </h2>
            <p style={graphNameStyle}>{graphName}</p>
          </div>
        </div>
      )}

      {position === "center" && (
        <div
          className={`charts-data-center ${
            theme === "light"
              ? "charts-data-center-light"
              : "charts-data-center-dark"
          }`}
        >
          <h2 style={graphValueStyle}>
            {graphValue}{" "}
            <span style={{ fontSize: "16px" }}>{unit && unit}</span>
          </h2>
          <p style={graphNameStyle}>{graphName}</p>
        </div>
      )}
    </div>
  );
};

export default ChartsData;
