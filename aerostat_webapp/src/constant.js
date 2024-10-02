export const windGaugeOptions = (theme, min = 0, max = 70, seriesData, size) => {
    const needleValue = seriesData[0];
    return {
        chart: {
            type: 'gauge',
            plotBorderWidth: 0,
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotShadow: false,
            backgroundColor: "transparent",
            height: size,
            width: size
        },
        plotOptions: {
            gauge: {
                dataLabels: {
                    enabled: false
                }
            }
        },
        title: {
            text: ''
        },
        pane: {
            startAngle: -150,
            endAngle: 150,
            background: [{
                backgroundColor: 'transparent',
                borderWidth: 0,
                outerRadius: '100%'
            }]
        },
        yAxis: {
            min: min,
            max: max,
            tickInterval: 5,
            tickWidth: 2,
            tickPosition: 'inside',
            tickLength: 4,
            tickColor: theme === 'light' ? '#666666' : '#AAAD9C',
            minorTickInterval: null,
            lineWidth: 0.5,
            labels: {
                distance: -15,
                rotation: 'auto',
                style: {

                    color: theme === 'light' ? '#1B1A1A' : '#AAAD9C'
                }
            },
            title: {
                text: ''
            },
            lineColor: theme === 'light' ? '#666666' : '#AAAD9C',
            plotBands: [
                {
                    from: 0,
                    to: needleValue < 24 ? needleValue : 24,
                    color: needleValue >= 0 ? '#5fd400' : "transparent",
                    thickness: '20%'
                },
                {
                    from: 24,
                    to: needleValue < 39 ? needleValue : 39,
                    color: needleValue >= 24 ? "#eef02c" : "transparent",
                    thickness: '20%'
                },
                {
                    from: 39,
                    to: needleValue < 70 ? needleValue : 70,
                    color: needleValue >= 39 ? "#e0403b" : "transparent",
                    thickness: '20%'
                }
            ]
        },
        series: [{
            name: '',
            data: seriesData,
            tooltip: {
                valueSuffix: ' km/h',
            },
            dial: {
                radius: '80%',
                backgroundColor: theme === 'light' ? '#666666' : '#FFFFFF', // Light theme: same as tick color, Dark theme: white
                baseWidth: 8,
                baseLength: '0%',
                rearLength: '0%',
            },
            pivot: {
                backgroundColor: theme === 'light' ? '#666666' : '#FFFFFF',
                radius: 3,
                baseWidth: 8,
            }
        }]
    };
};



export const pressureGaugeOptions = (theme, min = 0, max = 610, seriesData, size) => {
    const needleValue = seriesData[0];
    return {
        chart: {
            type: 'gauge',
            plotBorderWidth: 0,
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotShadow: false,
            backgroundColor: "transparent",
            height: size,
            width: size
        },
        plotOptions: {
            gauge: {
                dataLabels: {
                    enabled: false
                }
            }
        },
        title: {
            text: ''
        },
        pane: {
            startAngle: -150,
            endAngle: 150,
            background: [{
                backgroundColor: 'transparent',
                borderWidth: 0,
                outerRadius: '100%'
            }]
        },
        yAxis: {
            min: min,
            max: max,
            tickInterval: 0.5,
            tickWidth: 2,
            tickPosition: 'inside',
            tickLength: 4,
            tickColor: theme === 'light' ? '#666666' : '#666666',
            minorTickInterval: null,
            lineWidth: 0.5,
            labels: {
                distance: size === 200 ? -13 : -15,
                rotation: 'auto',
                style: {
                    color: theme === 'light' ? '#1B1A1A' : '#1B1A1A',
                    fontSize: size === 200 ? '10px' : '12px'
                }
            },
            title: {
                text: ''
            },
            lineColor: theme === 'light' ? '#666666' : '#AAAD9C',
            plotBands: [{
                from: 0,
                to: 0.5,
                color: '#d94343',
                thickness: "20%",
            }, {
                from: 0.5,
                to: 1.5,
                color: "#eef02c",
                thickness: "20%",
            }, {
                from: 1.5,
                to: 2.7,
                color: "#5fd400",
                thickness: "20%",
            }, {
                from: 2.7,
                to: 4.4,
                color: "#eef22c",
                thickness: "20%",
            }, {
                from: 4.4,
                to: 6,
                color: "#f6331f",
                thickness: "20%",
            }]
        },
        series: [{
            name: '',
            data: seriesData,
            tooltip: {
                valueSuffix: ' km/h',
            },
            dial: {
                radius: '80%',
                backgroundColor: theme === 'light' ? '#666666' : '#FFFFFF', // Light theme: same as tick color, Dark theme: white
                baseWidth: 8,
                baseLength: '0%',
                rearLength: '0%',
            },
            pivot: {
                backgroundColor: theme === 'light' ? '#666666' : '#FFFFFF',
                radius: 3,
                baseWidth: 8,
            }
        }]
    }
}



export const confluenceGaugeOptions = (theme, min = 0, max = 700, seriesData, size) => {
    const needleValue = seriesData[0];
    return {
        chart: {
            type: 'gauge',
            plotBorderWidth: 0,
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotShadow: false,
            backgroundColor: "transparent",
            height: size,
            width: size
        },
        plotOptions: {
            gauge: {
                dataLabels: {
                    enabled: false
                }
            }
        },
        title: {
            text: ''
        },
        pane: {
            startAngle: -150,
            endAngle: 150,
            background: [{
                backgroundColor: 'transparent',
                borderWidth: 0,
                outerRadius: '100%'
            }]
        },
        yAxis: {
            min: min,
            max: max,
            tickInterval: 50,
            tickWidth: 2,
            tickPosition: 'inside',
            tickLength: 4,
            tickColor: theme === 'light' ? '#666666' : '#AAAD9C',
            minorTickInterval: null,
            lineWidth: 0.5,
            labels: {
                distance: -15,
                rotation: 'auto',
                style: {
                    fontSize: size === 200 ? "8px" : "12px",
                    color: theme === 'light' ? '#1B1A1A' : '#AAAD9C'
                }
            },
            title: {
                text: ''
            },
            lineColor: theme === 'light' ? '#666666' : '#AAAD9C',
            plotBands: [
                {
                    from: 0,
                    to: needleValue < 49 ? needleValue : 49,
                    color: needleValue >= 0 ? '#eeed2c' : "transparent",
                    thickness: "20%",
                }, {
                    from: 49,
                    to: needleValue < 350 ? needleValue : 350,
                    color: needleValue >= 49 ? "#5fd400" : "transparent",
                    thickness: "20%",
                }
                , {
                    from: 350,
                    to: needleValue < 500 ? needleValue : 500,
                    color: needleValue >= 350 ? "#eeef2c" : "transparent",
                    thickness: "20%",
                }
                , {
                    from: 500,
                    to: needleValue < 700 ? needleValue : 700,
                    color: needleValue >= 500 ? "#f64a20" : "transparent",
                    thickness: "20%",
                }
            ]

        },
        series: [{
            name: '',
            data: seriesData,
            tooltip: {
                valueSuffix: ' km/h',
            },
            dial: {
                radius: '80%',
                backgroundColor: theme === 'light' ? '#666666' : '#FFFFFF', // Light theme: same as tick color, Dark theme: white
                baseWidth: 8,
                baseLength: '0%',
                rearLength: '0%',
            },
            pivot: {
                backgroundColor: theme === 'light' ? '#666666' : '#FFFFFF',
                radius: 3,
                baseWidth: 8,
            }
        }]
    }
}
