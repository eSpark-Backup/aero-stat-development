// export const getGaugeOptions = (theme, min = 0, max = 610, seriesData = [450]) => {
//     const needleValue = seriesData[0];
//     return {
//         chart: {
//             type: 'gauge',
//             plotBorderWidth: 0,
//             plotBackgroundColor: null,
//             plotBackgroundImage: null,
//             plotShadow: false,
//             backgroundColor: "transparent",
//             height: 300,
//             width: 300
//         },
//         plotOptions: {
//             gauge: {
//                 dataLabels: {
//                     enabled: false
//                 }
//             }
//         },
//         title: {
//             text: ''
//         },
//         pane: {
//             startAngle: -150,
//             endAngle: 150,
//             background: [{
//                 backgroundColor: 'transparent',
//                 borderWidth: 0,
//                 outerRadius: '100%'
//             }]
//         },
//         yAxis: {
//             min: min,
//             max: max,
//             tickInterval: (max - min) / 10,
//             tickWidth: 2,
//             tickPosition: 'inside',
//             tickLength: 6,
//             tickColor: theme === 'light' ? '#212121' : '#AAAD9C',
//             minorTickInterval: null,
//             lineWidth: 1,
//             labels: {
//                 rotation: 'auto',
//                 style: {

//                     color: theme === 'light' ? '#101010' : '#AAAD9C'
//                 }
//             },
//             title: {
//                 text: ''
//             },
//             lineColor: theme === 'light' ? '#101010' : '#AAAD9C',
//             plotBands: [{
//                 from: min,
//                 to: min + (max - min) * 0.28,
//                 color: '#eef22c',
//                 thickness: -10,
//             }, {
//                 from: min + (max - min) * 0.28,
//                 to: min + (max - min) * 0.75,
//                 color: needleValue > min + (max - min) * 0.28 ? '#49c770' : 'transparent',
//                 thickness: -10,
//             }, {
//                 from: min + (max - min) * 0.75,
//                 to: max,
//                 color: needleValue >= min + (max - min) * 0.75?'#ff4c4c':'transparent',
//                 thickness: -10,
//             }]
//         },
//         series: [{
//             name: '',
//             data: seriesData,
//             tooltip: {
//                 valueSuffix: ' km/h',
//             },
//             dial: {
//                 radius: '80%',
//                 backgroundColor: theme === 'light' ? '#272525' : '#AAAD9C',
//                 baseWidth: 8,
//                 baseLength: '0%',
//                 rearLength: '0%',
//             },
//             pivot: {
//                 backgroundColor: theme === 'light' ? '#272525' : '#AAAD9C',
//                 radius: 3,
//                 baseWidth: 8,
//             },
//         }]
//     }
// }


export const getGaugeOptions = (theme, min = 0, max = 610, seriesData = [450]) => {
    const needleValue = seriesData[0];
    return {
        chart: {
            type: 'gauge',
            plotBorderWidth: 0,
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotShadow: false,
            backgroundColor: "transparent",
            height: 300,
            width: 300
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
            plotBands: [
                {
                    from: -700,
                    to: -466.67,
                    color: '#F14949',
                    thickness: '15%'
                },
                {
                    from: -466.66,
                    to: -233.33,
                    color: '#5F9059',
                    thickness: '15%'
                },
                {
                    from: -233.32,
                    to: 0,
                    color: '#55955A',
                    thickness: '15%'
                },
                {
                    from: 0,
                    to: 233.33,
                    color: '#EEF22C',
                    thickness: '15%'
                },
                {
                    from: 233.34,
                    to: 466.67,
                    color: '#42CC71',
                    thickness: '15%'
                },
                {
                    from: 466.68,
                    to: 700,
                    color: '#D84444',
                    thickness: '15%'
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