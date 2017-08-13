function HeatMap(containerId, heatData) {

    require.config({
        paths: {
            echarts: '../lib/echarts'
        }
    });


    option = {
        title: {
            text: '热力图自定义样式'
        },
        series: [
            {
                type: 'heatmap',
                data: heatData,
                hoverable: false,
                gradientColors: [{
                    offset: 0.4,
                    color: 'green'
                }, {
                    offset: 0.6,
                    color: 'yellow'
                }, {
                    offset: 0.8,
                    color: 'orange'
                }, {
                    offset: 1,
                    color: 'red'
                }],
                minAlpha: 0.2,
                valueScale: 10,
                opacity: 0.5
            }
        ]
    };


    require(['echarts', 'echarts/chart/heatmap'], function (echarts, Heatmap) {
        var myChart = echarts.init(document.getElementById(containerId));
        myChart.setOption(option);
    });
}