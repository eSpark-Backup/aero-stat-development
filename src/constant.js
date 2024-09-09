// Define your gaugeOptions as a function that takes 'theme' as a parameter
export const getGaugeOptions = (theme) => {
    return {
        chart: {
            type: 'gauge',
            plotBorderWidth: 0,
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotShadow: false,
            backgroundColor: "transparent"
        },
        plotOptions: {
            gauge: {
                dataLabels: {
                    enabled: false // This hides the central data label
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
            min: 0,
            max: 610,
            tickPixelInterval: 30,
            tickWidth: 2,
            tickPosition: 'inside',
            tickLength: 10,
            tickColor: '#666',
            labels: {
                step: 2,
                rotation: 'auto',
                style: {
                    // Set color based on theme
                    color: theme === 'light' ? '#101010' : '#AAAD9C'
                }
            },
            title: {
                text: ''
            },
            plotBands: [{
                from: 0,
                to: 150,
                color: '#FAFF01'
            }, {
                from: 151,
                to: 450,
                color: '#09F012'
            }, {
                from: 451,
                to: 610,
                color: '#FF4C4C'
            }]
        },
        series: [{
            name: '',
            data: [450],
            tooltip: {
                valueSuffix: ' km/h',
            }
        }]
    }
}
