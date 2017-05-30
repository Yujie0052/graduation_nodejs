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
            }
        });

    });

});