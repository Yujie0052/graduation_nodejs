function AoiGenerator(btnAOI, paperArea) {

    var $btnAOI = btnAOI;
    var $paperArea = paperArea;
    var count = 1;

    var aoisCoordinate = [];    //保存每个aoi，aoi包含信息：左上角x坐标、y坐标，宽、高
    var beginX, beginY, width, height;


    this.getAoisCoordinate = function () {
        return aoisCoordinate;
    };

    this.init = function () {
        $btnAOI.on("click", function () {
            createAOI();
        });
    };

    function createAOI() {
        var $screenArea = $("<div></div>");
        $screenArea.css({
            "width": $paperArea.css('width'),
            "height": $paperArea.css('height'),
            "position": "absolute",
            "left": "0px",
            "top": "0px",
            "opacity": 0.6,
            "backgroundColor" : "grey",
            "cursor" : "crosshair"
        });
        $paperArea.append($screenArea);
        $screenArea.mousedown(drawAOI);
        $screenArea.mouseup(completeDraw);
    }

    function drawAOI(event) {
        var e = event || window.event;
        var beginPos = {"x": e.pageX, "y": e.pageY};
        var clipImg = createClipImage(beginPos);
        $paperArea.append(clipImg);

        $paperArea.mousemove(function (moveEvent) {
            var rectWidth = moveEvent.pageX - beginPos.x,
                rectHeight = moveEvent.pageY - beginPos.y;
            clipImg.css("clip", "rect(" + beginPos.y + "px," +
                moveEvent.pageX + "px," + moveEvent.pageY + "px," + beginPos.x + "px)");

            beginX = beginPos.x;
            beginY = beginPos.y;
            width = rectWidth;
            height = rectHeight;

        });
    }

    function completeDraw() {

        $paperArea.unbind("mousemove");

        var rect = {};  //保存aoi的左上角坐标和宽高
        rect.id = count++;
        rect.xmin = beginX;
        rect.ymin = beginY;
        rect.xmax = beginX + width;
        rect.ymax = beginY + height;
        aoisCoordinate.push(rect);

        var opaqueDiv = $('<div></div>');
        opaqueDiv.html('AOI' + rect.id);
        opaqueDiv.css({
            'position': 'absolute',
            'top': beginY,
            'left': beginX,
            'width': width,
            'height': height,
            'text-align': 'center',
            'color': 'red'
        });
        $paperArea.append(opaqueDiv);
    }

    function createClipImage(beginPos) {
        var img = $("<img src='images/paper.png'/>");
        img.css({
            "position": "absolute",
            "left": "0px",
            "top": "0px",
            "clip" : "rect(" + beginPos.y + "px,0px,0px," + beginPos.x + "px)"
        });
        return img;
    }
}