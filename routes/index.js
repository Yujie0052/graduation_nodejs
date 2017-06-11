var express = require('express');
var tfidf = require('tfidf');
var rf = require('fs');
var unique = require('array-unique');
var router = express.Router();
var AoiUtils = require('../public/js/aoi_utils');
var syncLoadCSV = require('../public/js/data_loader');
var gm = require('gm');
var AipOcr = require("aip-node-sdk-1.0.0").ocr;


router.get('/', function (req, res, next) {
    res.render('index');
});


router.post('/ajax_demo', function (req, res, next) {

    var aoisCoordinate = eval('(' + req.body.aoisCoordinate + ')');
    recognizeAoiText(aoisCoordinate);

    var fixationDataArr = syncLoadCSV();

    var aoiUtils = new AoiUtils();

    var readSpeed = aoiUtils.caculateReadSpeed(fixationDataArr, aoisCoordinate);
    var readCount = aoiUtils.caculateReadCount(fixationDataArr, aoisCoordinate, 500, 500);
    var switchCount = aoiUtils.caculateSwitchCount(fixationDataArr, aoisCoordinate, 500);

    res.send({'readSpeed': readSpeed, 'readCount': readCount, 'switchCount': switchCount});
});

function recognizeAoiText(aoisCoordinate) {

    var client = initOcrClient();
    var result = [];

    aoisCoordinate.forEach(function (aoi, index) {
        var width = aoi.xmax - aoi.xmin;
        var height = aoi.ymax - aoi.ymin;
        gm('public/images/paper.png').crop(width, height, aoi.xmin, aoi.ymin)
            .write('public/images/aoi_' + aoi.id + '.png', function (err) {
                if (err) {
                    console.log(err);
                    res.end();
                }

                result.push({'aoi_id' : aoi.id, 'text_info' : ocr(aoi.id, client)});

                if (index == aoisCoordinate.length - 1) {

                    //console.log(JSON.stringify(result));
                }
            });
    });
}

function initOcrClient() {
    // 设置APPID/AK/SK
    var APP_ID = "9753076";
    var API_KEY = "BW3b1KoXx0wf8wFL4qUkhpWv";
    var SECRET_KEY = "G0uGUGfuMgefPr0dEIPkS0LPaWb32GRx";
    var client = new AipOcr(APP_ID, API_KEY, SECRET_KEY);
    return client;
}

/**
 * 对图片上传之百度云进行ocr文字识别
 * @param aoi_id
 */
function ocr(aoi_id, client) {
    var image = rf.readFileSync('public/images/aoi_' + aoi_id + '.png');
    var base64Img = new Buffer(image).toString('base64');
    client.generalBasic(base64Img).then(function(result) {
        console.log(JSON.stringify(result))
        return result;
    });
}


router.get('/test_tfidf', function (req, res, next) {

    var doc = rf.readFileSync("public/data/test_en0.txt", "utf-8").toString();
    var docCorpus = rf.readFileSync("public/data/corpus.txt", "utf-8").toString();

    var stopWords = rf.readFileSync('public/data/stop_words.txt', 'utf-8').toString().split(/\s+/);

    var analyzer = tfidf.analyze([doc, docCorpus], stopWords);

    var word_tfidf = [];
    var words = unique(tfidf.preProcess(tfidf.tokenize(doc), stopWords));

    words.forEach(function (word) {
        word_tfidf.push({'word': word, 'tfidf': analyzer.tfidf(word, doc)});
    });

    word_tfidf.sort(function (w1, w2) {
        return Math.abs(w2.tfidf) - Math.abs(w1.tfidf);
        // return w1.tfidf - w2.tfidf;
    });
    res.render('tfidf', {'word_tfidf': JSON.stringify(word_tfidf.slice(0, 20))});
    // res.render('tfidf', {'word_tfidf' : JSON.stringify(word_tfidf)});


});


module.exports = router;
