var express = require('express');
var router = express.Router();
var AoiUtils = require('../public/js/aoi_utils');
var syncLoadCSV = require('../public/js/data_loader');


router.get('/', function(req, res, next) {
  res.render('index');
});


router.post('/ajax_demo', function(req, res, next) {

  var aoisCoordinate = eval('(' + req.body.aoisCoordinate + ')');
  var fixationDataArr = syncLoadCSV();

  var aoiUtils = new AoiUtils();

  var readSpeed = aoiUtils.caculateReadSpeed(fixationDataArr, aoisCoordinate);
  var readCount = aoiUtils.caculateReadCount(fixationDataArr, aoisCoordinate, 500, 500);
  var switchCount = aoiUtils.caculateSwitchCount(fixationDataArr, aoisCoordinate, 500);

  res.send({'readSpeed' : readSpeed, 'readCount' : readCount, 'switchCount' : switchCount});
});

module.exports = router;
