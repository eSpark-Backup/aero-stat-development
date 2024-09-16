import React from "react";

const Compass = ({ variant, heading, angle }) => {
  const radius = 90;
  const gap = 10;
  const colors = {
    group1: "#e9efec",
    group2: "#c4dad2",
    group3: "#f9fcff",
  };

  const getColor = (i) => {
    if (i % 4 === 0) {
      return colors.group1;
    } else if ((i - 2) % 4 === 0) {
      return colors.group2;
    } else {
      return colors.group3;
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        boxShadow: "0px 0px 4px 0px #00000040",
        borderRadius: "50%",
        padding: "5px",
        background: "#FFF",
      }}
    >
      <svg
        width="240"
        height="240"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke="#6A9C89"
          strokeWidth="3"
          fill="transparent"
        />

        {[...Array(16)].map((_, i) => (
          <path
            key={i}
            d={`M 100 100 
            L ${
              100 +
              (radius - gap) * Math.cos((i * 22.5 - 11.25) * (Math.PI / 180))
            } ${
              100 +
              (radius - gap) * Math.sin((i * 22.5 - 11.25) * (Math.PI / 180))
            } 
            A ${radius - gap} ${radius - gap} 0 0 1 ${
              100 +
              (radius - gap) * Math.cos((i * 22.5 + 11.25) * (Math.PI / 180))
            } ${
              100 +
              (radius - gap) * Math.sin((i * 22.5 + 11.25) * (Math.PI / 180))
            } Z`}
            fill={getColor(i)}
          />
        ))}

        {["N", "S", "E", "W"].map((dir, i) => {
          const positions = {
            N: { x: 104, y: 10, width: "25", height: "20" },
            S: { x: 104, y: 199, width: "25", height: "20" },
            E: { x: 191, y: 100, width: "20", height: "25" },
            W: { x: 8, y: 100, width: "20", height: "25" },
          };

          return (
            <g key={dir}>
              <rect
                x={positions[dir].x - 10}
                y={positions[dir].y - 15}
                width={positions[dir].width}
                height={positions[dir].height}
                fill="white"
              />
              <text
                x={positions[dir].x}
                y={positions[dir].y}
                fill="red"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
                alignmentBaseline={dir === "S" ? "top" : "middle"}
              >
                {dir}
              </text>
            </g>
          );
        })}

        {[...Array(16)].map((_, i) => (
          <g key={i} transform={`rotate(${i * 22.5}, 100, 100)`}>
            {i !== 0 && i !== 4 && i !== 8 && i !== 12 && (
              <line
                x1="100"
                y1="10"
                x2="100"
                y2="20"
                stroke="green"
                strokeWidth="2"
              />
            )}
            <text
              x="100"
              y="35"
              textAnchor="middle"
              fill="#101010"
              fontSize="8"
            >
              {i * 45}°
            </text>
          </g>
        ))}

        {variant === "single" ? (
          <svg
            id="compass"
            width="200"
            height="200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              id="arrow"
              d="M 45 100 L 95 97 L 100 103 Z"
              fill="#272525"
              stroke="#272525"
              strokeWidth="1"
              transform={`rotate(${90 + heading / 2} 100 100)`}
            />
            <circle cx="100" cy="100" r="7.99" fill="#16423C" />
          </svg>
        ) : (
          <>
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="40"
              stroke="#FF0000"
              strokeWidth="3"
              transform={`rotate(${heading / 2} 100 100)`}
            />
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="40"
              stroke="#0075FF"
              strokeWidth="3"
              transform={`rotate(${angle / 2} 100 100)`}
            />
            <circle cx="100" cy="100" r="8" fill="#16423C" />
          </>
        )}
      </svg>
    </div>
  );
};

export default Compass;
