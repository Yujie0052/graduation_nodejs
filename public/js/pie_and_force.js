/**
 * Created by YujieSun on 2017/8/13.
 */
function PieAndForce(pieContainerId, forceContainerId, pidData, forceData, originData) {

    require.config({
        paths: {
            echarts: '../lib/echarts'
        }
    });

    var legendData = [];
    $.each(pidData, function (index, item) {
       legendData.push(item.name);
    });

    pieOption = {
        tooltip : {
            trigger: 'item',
            formatter: function (params,ticket,callback) {
                var aoiID = params['1'].split('AOI')[1];
                var readSpeed = originData.gazeData.readSpeed;
                var readCount = originData.gazeData.readCount;
                var keywordsCount = originData.keywordsCount;
                var res = '';
                for (var i = 0; i < readSpeed.length; i++) {
                    if (readSpeed[i].aoiID == aoiID) {
                        res += '阅读速度：' + readSpeed[i].speed.toFixed(2)
                            + '<br/>阅读次数：' + readCount[i].count
                            + '<br/>关键词个数：' + keywordsCount[i].count;
                    }
                }
                return res;
            }
        },
        legend: {
            orient : 'vertical',
            x : 'left',
            data: legendData
        },

        calculable : true,
        series : [
            {
                name:'',
                type:'pie',
                radius : ['50%', '70%'],
                itemStyle : {
                    normal : {
                        label : {
                            show : false
                        },
                        labelLine : {
                            show : false
                        }
                    },
                    emphasis : {
                        label : {
                            show : true,
                            position : 'center',
                            textStyle : {
                                fontSize : '30',
                                fontWeight : 'bold'
                            }
                        }
                    }
                },
                data: pidData
            }
        ],
        color: ['rgb(254,67,101)','rgb(252,157,154)','rgb(249,205,173)','rgb(200,200,169)','rgb(131,175,155)']
    };

    forceOption = {

        tooltip : {
            trigger: 'item',
            formatter: '<img src="images/{b}.png"/>'
        },

        legend: {
            x: 'left',
            data:['重要段落', '普通段落']
        },
        series : [
            {
                type:'force',
                name : "段落关系",
                ribbonType: false,
                categories : [
                    {
                        name: '重要段落'
                    },
                    {
                        name: '普通段落'
                    }
                ],
                itemStyle: {
                    normal: {
                        label: {
                            show: true,
                            textStyle: {
                                color: '#333'
                            }
                        },
                        nodeStyle : {
                            brushType : 'both',
                            borderColor : 'rgba(255,215,0,0.4)',
                            borderWidth : 1
                        },
                        linkStyle: {
                            type: 'curve'
                        }
                    },
                    emphasis: {
                        label: {
                            show: false
                            // textStyle: null      // 默认使用全局文本样式，详见TEXTSTYLE
                        },
                        nodeStyle : {
                            //r: 30
                        },
                        linkStyle : {}
                    }
                },
                useWorker: false,
                minRadius : 15,
                maxRadius : 25,
                gravity: 1.1,
                scaling: 1.1,
                roam: 'move',
                nodes: forceData.nodes,
                links : forceData.links
            }
        ]
    };



    require(['echarts', 'echarts/chart/pie', 'echarts/chart/force'], function (echarts, pie, force) {
        var pieChart = echarts.init(document.getElementById(pieContainerId));
        pieChart.setOption(pieOption);
        var forceChart = echarts.init(document.getElementById(forceContainerId));
        forceChart.setOption(forceOption);
    });
}