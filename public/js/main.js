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
                console.log(JSON.stringify(data));
                displayForceGraph(data);
            }
        });

    });

    $('#textAnalysis').on('click', function () {
        $(this).attr('href', 'http://localhost:3000/test_tfidf');
    });

    function tick() {
        console.log("已经等待" + ++count + "秒");
    }

    function displayForceGraph(data) {

        var readSpeed = data.gazeData.readSpeed;
        var nodes = [];
        readSpeed.forEach(function (element) {
           nodes.push({name : 'AOI' + element.aoiID});
        });

        var switchCount = data.gazeData.switchCount;
        var edges = [];
        for (jump in switchCount) {
            var source = parseInt(jump.split('->')[0]);
            var target = parseInt(jump.split('->')[1]);
            edges.push({source : source, target : target});
        }

        var width = 707,
            height = 422;

        var svg = d3.select('#force-container')
            .append('svg')
            .attr({
                'width': width,
                'height': height
            });

        var force = d3.layout.force()
            .nodes(nodes)
            .links(edges)
            .size([width, height])
            .charge(-400)
            .linkDistance(180)
            .start();

        var circles = svg.selectAll('circle')
            .data(nodes)
            .enter()
            .append('circle')
            .attr({
                'fill': 'gray',
                'r': function (d, i) {
                    return 10 + Math.round(Math.random() * 20);
                }
            })
            .call(force.drag);

        var lines = svg.selectAll('line')
            .data(edges)
            .enter()
            .append('line')
            .attr({
                'stroke': 'gray',
                'stroke-width': function (d, i) {
                    return 1 + Math.round(Math.random() * 3);
                }
            });

        force.on('tick', function () {
            circles.attr({
                'cx': function (d, i) {
                    return d.x;
                },
                'cy': function (d, i) {
                    return d.y;
                }
            });

            lines.attr({
                'x1': function (d, i) {
                    return d.source.x;
                },
                'y1': function (d, i) {
                    return d.source.y;
                },
                'x2': function (d, i) {
                    return d.target.x;
                },
                'y2': function (d, i) {
                    return d.target.y;
                }
            });
        });
    }

});