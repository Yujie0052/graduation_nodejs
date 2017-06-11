/**
 * Created by YujieSun on 2017/5/30.
 */

$(function() {
    var aoiGenerator = new AoiGenerator($('#btnAOI'), $('#paperArea'));
    aoiGenerator.init();

    $("#compleAOI").on("click", function() {
        var aoisCoordinate = aoiGenerator.getAoisCoordinate();

        $.ajax({
            data: 'aoisCoordinate=' + JSON.stringify(aoisCoordinate),
            url: '/ajax_demo',
            dataType: 'json',
            type: 'post',
            success: function (data) {
                console.log(JSON.stringify(data['readSpeed']));
                console.log(JSON.stringify(data['readCount']));
                console.log(JSON.stringify(data['switchCount']));
            }
        });

    });

    $('#textAnalysis').on('click', function () {
        $(this).attr('href', 'http://localhost:3000/test_tfidf');
    });

});