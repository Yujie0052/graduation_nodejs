var express = require('express');
var tfidf = require('tfidf');
var rf = require('fs');
var unique = require('array-unique');
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


router.get('/test_tfidf', function(req, res, next) {

  var doc = rf.readFileSync("public/data/test_en.txt", "utf-8").toString();
  var stopWords = rf.readFileSync('public/data/stop_words.txt', 'utf-8').toString().split(/\s+/);

  var analyzer = tfidf.analyze([doc], stopWords);

  var word_tfidf = [];
  var words = unique(tfidf.preProcess(tfidf.tokenize(doc), stopWords));

  words.forEach(function (word) {
    word_tfidf.push({'word' : word , 'tfidf' : analyzer.tfidf(word, doc)});
  });

  word_tfidf.sort(function(w1, w2) {
    return w2.tfidf - w1.tfidf;
  });
  res.render('tfidf', {'word_tfidf' : JSON.stringify(word_tfidf.slice(0, 20))});

});


module.exports = router;
