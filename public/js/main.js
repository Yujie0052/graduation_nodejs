$(function() {
    var aoiGenerator = new AoiGenerator($('#btnAOI'), $('#paperArea'));
    aoiGenerator.init();

    var handler = null;
    var count = 0;

    $("#compleAOI").on("click", function() {
        var aoisCoordinate = aoiGenerator.getAoisCoordinate();

        $.ajax({
            data: 'aoisCoordinate=' + JSON.stringify(aoisCoordinate),
            url: '/ajax_demo',
            dataType: 'json',
            type: 'post',
            beforeSend : function() {
                handler = setInterval(tick, 1000);
            },
            success: function (data) {
                clearInterval(handler);
                var forceData = {};
                var nodes = [];
                var links = [];
                var gazeData = data.gazeData;

                var readSpeed = normalization(gazeData.readSpeed, 'speed');
                var readCount = normalization(gazeData.readCount, 'count');
                var keywordsCount = normalization(data.keywordsCount, 'count');
                for (var i = 0; i < readSpeed.length; i++) {
                    var nodeWeight = (1 - readSpeed[i].speed) + readCount[i].count + keywordsCount[i].count;
                    nodes.push({name: 'AOI' + readSpeed[i].aoiID, value: nodeWeight, category: 1});
                }

                var topK = 5;
                setImportantParagraph(nodes, topK);

                var switchCount = gazeData.switchCount;
                for (var jump in switchCount) {
                    var source = 'AOI' + jump.split('->')[0];
                    var target = 'AOI' + jump.split('->')[1];
                    var linkWeight = switchCount[jump];
                    links.push({source: source, target: target, weight: linkWeight});
                }

                forceData.nodes = nodes;
                forceData.links = links;
                //Force('force-container', forceData);

                var pieData = [];
                for (var i = 0; i < topK; i++) {
                    pieData.push({name: nodes[i].name, value: nodes[i].value});
                }
                PieAndForce('annulus-container', 'force-container',  pieData, forceData, data);
            }
        });

    });

    function setImportantParagraph(nodes, topK) {
        nodes.sort(function (a, b) {
            return b.value - a.value;
        });
        for (var i = 0; i < topK && nodes.length; i++) {
            nodes[i].category = 0;
        }
    }

    function normalization(data, property) {
        var values = [];
        $.each(data, function(index, item) {
           values.push(item[property]);
        });
        var min = Math.min.apply(null, values);
        var max = Math.max.apply(null, values);
        var delta = (min == max) ? min : max - min;

        var result = [];
        $.each(data, function(index, item) {
            var obj = {};
            for (var key in item) {
                obj[key] = item[key];
            }
            obj[property] = (obj[property] - min) / delta;
            result.push(obj);
        });
        return result;
    }

    function createRandomItemStyle() {
        return {
            normal: {
                color: 'rgb(' + [
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160)
                ].join(',') + ')'
            }
        };
    }

    $('#wordCloud').click(function() {
       $.get(
           'get_tfidf_keywords',
           function(data) {
               var wordCloudData = $.map(data, function (item) {
                   return {name : item.term, value : (item.tfidf * 10000).toFixed(2), itemStyle : createRandomItemStyle()};
               });
               WordCloud('cloud-container', wordCloudData);
           }
       );
    });

    $('#heatMap').click(function () {
        $.get(
            'get_origin_data',
            function(data) {
                var heatData= [];
                $.each(data, function(index, item) {
                   heatData.push([item.fixationX, item.fixationY, item.duration]);
                });
                HeatMap('heat-container', heatData);
            }
        );
        if($('#heat-container').is(':hidden')){//如果当前隐藏
            $('#heat-container').show();//那么就显示div
        }else{//否则
            $('#heat-container').hide();//就隐藏div
        }
    });

    $('#textAnalysis').on('click', function () {
        // $(this).attr('href', 'http://localhost:3000/test_tfidf');
        $(this).attr('href', '/get_tfidf_keywords');
    });

    function tick() {
        console.log("已经等待" + ++count + "秒");
    }

    // function displayForceGraph(data) {
    //
    //     var readSpeed = data.gazeData.readSpeed;
    //     var nodes = [];
    //     readSpeed.forEach(function (element) {
    //        nodes.push({name : 'AOI' + element.aoiID});
    //     });
    //
    //     var switchCount = data.gazeData.switchCount;
    //     var edges = [];
    //     for (jump in switchCount) {
    //         var source = parseInt(jump.split('->')[0]) - 1;
    //         var target = parseInt(jump.split('->')[1]) - 1;
    //         edges.push({source : source, target : target});
    //     }
    //
    //     var width = 707,
    //         height = 422;
    //
    //     var svg = d3.select('#force-container')
    //         .append('svg')
    //         .attr({
    //             'width': width,
    //             'height': height
    //         });
    //
    //     var force = d3.layout.force()
    //         .nodes(nodes)
    //         .links(edges)
    //         .size([width, height])
    //         .charge(-400)
    //         .linkDistance(200)
    //         .start();
    //
    //     var circles = svg.selectAll('circle')
    //         .data(nodes)
    //         .enter()
    //         .append('circle')
    //         .attr({
    //             'fill': 'gray',
    //             'r': function (d, i) {
    //                 return 10 + Math.round(Math.random() * 20);
    //             }
    //         })
    //         .call(force.drag);
    //
    //     var lines = svg.selectAll('line')
    //         .data(edges)
    //         .enter()
    //         .append('line')
    //         .attr({
    //             'stroke': 'gray',
    //             'stroke-width': function (d, i) {
    //                 return 1 + Math.round(Math.random() * 3);
    //             }
    //         });
    //
    //     var linetext = svg.selectAll('.linetext')
    //         .data()
    //
    //     force.on('tick', function () {
    //         circles.attr({
    //             'cx': function (d, i) {
    //                 return d.x;
    //             },
    //             'cy': function (d, i) {
    //                 return d.y;
    //             }
    //         });
    //
    //         lines.attr({
    //             'x1': function (d, i) {
    //                 return d.source.x;
    //             },
    //             'y1': function (d, i) {
    //                 return d.source.y;
    //             },
    //             'x2': function (d, i) {
    //                 return d.target.x;
    //             },
    //             'y2': function (d, i) {
    //                 return d.target.y;
    //             }
    //         });
    //     });
    // }

});