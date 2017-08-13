/**
 * Created by YujieSun on 2017/8/5.
 */

function WordCloud(containerId, data) {

    require.config({
        paths: {
            echarts: '../lib/echarts'
        }
    });

    option = {
        title: {
            text: '',
            link: '#'
        },
        tooltip: {
            show: true
        },
        series: [{
            name: '',
            type: 'wordCloud',
            size: ['100%', '100%'],
            textRotation: [0, 45, 90, -45],
            textPadding: 0,
            autoSize: {
                enable: true,
                minSize: 14
            },
            data: data
        }]
    };


    // Step:4 require echarts and use it in the callback.
    // Step:4 动态加载echarts然后在回调函数中开始使用，注意保持按需加载结构定义图表路径
    require(['echarts', 'echarts/chart/wordCloud'], function (echarts, wordCloud) {
        var myChart = echarts.init(document.getElementById(containerId));
        myChart.setOption(option);
    });
}
