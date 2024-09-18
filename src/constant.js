// Define your gaugeOptions as a function that takes 'theme', 'min', 'max', and 'seriesData' as parameters
export const getGaugeOptions = (theme, min = 0, max = 610, seriesData = [450]) => {
    return {
        chart: {
            type: 'gauge',
            plotBorderWidth: 0,
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotShadow: false,
            backgroundColor: "transparent",
            height: 240,
            width: 240
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
            tickInterval: (max - min) / 10,
            tickWidth: 2,
            tickPosition: 'inside',
            tickLength: 6,
            tickColor: theme === 'light' ? '#212121' : '#AAAD9C',
            minorTickInterval: null,
            lineWidth: 1,
            labels: {
                rotation: 'auto',
                style: {
                    
                    color: theme === 'light' ? '#101010' : '#AAAD9C'
                }
            },
            title: {
                text: ''
            },
            lineColor: theme === 'light' ? '#101010' : '#AAAD9C',
            plotBands: [{
                from: min,
                to: min + (max - min) * 0.28,
                color: '#FAFF01',
                thickness: -25,
            }, {
                from: min + (max - min) * 0.28,
                to: min + (max - min) * 0.75,
                color: '#09F012',
                thickness: -25,
            }, {
                from: min + (max - min) * 0.75,
                to: max, // Third plot band
                color: '#FF4C4C',
                thickness: -25,
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
        }]
    }
}
