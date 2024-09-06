export const gaugeOptions = {
    chart: {
        type: 'gauge',
        plotBorderWidth: 0,
        plotBackgroundColor: null,
        plotBackgroundImage: null,
        plotShadow: false
    },
    title: {
        text: ''
    },
    pane: {
        startAngle: -150,
        endAngle: 150,
        background: [{
            backgroundColor: '#FFF',
            borderWidth: 0,
            outerRadius: '109%'
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
            rotation: 'auto'
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
        data: [450], // Initial value of the gauge
        tooltip: {
            valueSuffix: ' km/h'
        }
    }]
}