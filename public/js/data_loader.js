var rf = require('fs');
var d3_dsv = require('d3-dsv');

function syncLoadCSV() {

    //保存注视点信息：注视时间，x坐标，y坐标
    var fixationDataArr;
    var sequence = 1;
    var data = rf.readFileSync("public/data/fixationData.csv", "utf-8");

    fixationDataArr = d3_dsv.csvParseRows(data).map(function (row) {
        return {'sequence': sequence++, 'duration': +row[0], 'fixationX': +row[1], 'fixationY': +row[2]};
    });

    return fixationDataArr;
}

module.exports = syncLoadCSV;


