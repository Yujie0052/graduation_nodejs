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
        $paperArea.mousedown(drawAOI);
        $paperArea.mouseup(completeDraw);
    }

    function drawAOI(event) {
        var e = event || window.event;
        var beginPos = {"x": e.pageX, "y": e.pageY};
        var rect = createRect(beginPos);
        $paperArea.append(rect);

        $paperArea.mousemove(function (moveEvent) {
            var rectWidth = moveEvent.pageX - beginPos.x,
                rectHeight = moveEvent.pageY - beginPos.y;
            rect.css({
                "width": rectWidth + "px",
                "height": rectHeight + "px"
            });

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

        // console.log('AOI的x坐标：' + rect.xmin + ', y坐标： ' + rect.ymin + ", 宽： " + width + ', 高：' + height);

    }

    function createRect(beginPos) {
        var rects = $("<div></div>");
        rects.css({
            "width": "0px",
            "height": "0px",
            "position": "absolute",
            "border": "1px solid gray",
            "left": beginPos.x + "px",
            "top": beginPos.y + "px"
        });
        return rects;
    }
}