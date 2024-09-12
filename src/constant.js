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
            tickInterval: 50,
            tickWidth: 2,
            tickPosition: 'inside',
            tickLength: 6,
            tickColor: theme === 'light' ? '#212121' : '#AAAD9C',
            minorTickInterval: null,
            lineWidth: 1,
            labels: {
                rotation: 'auto',
                style: {
                    // Set color based on theme
                    color: theme === 'light' ? '#101010' : '#AAAD9C'
                }
            },
            title: {
                text: ''
            },
            lineWidth: 1,
            lineColor: theme === 'light' ? '#101010' : '#AAAD9C',
            plotBands: [{
                from: 0,
                to: 170,
                color: '#FAFF01',
                thickness: -25,
            }, {
                from: 170,
                to: 460,
                color: '#09F012',
                thickness: -25,
            }, {
                from: 460,
                to: 610,
                color: '#FF4C4C',
                thickness: -25,
            }]
        },
        series: [{
            name: '',
            data: [450],
            tooltip: {
                valueSuffix: ' km/h',
            },
            dial: {
                radius: '80%',
                backgroundColor: theme === 'light' ? '#272525' : '#AAAD9C',
                baseWidth: 8,
                baseLength: '0%',
                rearLength: '0%',
            },
            pivot: {
                backgroundColor: theme === 'light' ? '#272525' : '#AAAD9C',
                radius: 3,
                baseWidth: 8,
            },
        },
        
    ]
    }
}
