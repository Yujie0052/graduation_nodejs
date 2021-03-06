var express = require('express');
var tfidf = require('tfidf');
var rf = require('fs');
var router = express.Router();
var AoiUtils = require('../public/js/aoi_utils');
var syncLoadCSV = require('../public/js/data_loader');
var gm = require('gm');
var AipOcr = require("aip-node-sdk-1.0.0").ocr;
var sync = require('../public/js/sync_utils');

router.get('/', function (req, res, next) {
    res.render('index');
});

router.get('/get_tfidf_keywords', function (req, res, next) {
    var words_tfidf = caculateTfidf(100);
    res.send(words_tfidf);
});

router.get('/get_origin_data', function (req, res, next) {
    var originData = syncLoadCSV()
    res.send(originData);
});

router.post('/ajax_demo', function (req, res) {

    var aoisCoordinate = eval('(' + req.body.aoisCoordinate + ')');
    var client = initOcrClient();

    var ctx1 = {aoi : aoisCoordinate, index : 0};
    var ctx2 = {aoi : aoisCoordinate, client : client, index : 0, res : res, tfidfCount : []};
    sync.execute([cropImageClosure, ocrClosure], [ctx1, ctx2]);


});


function cropImageClosure(context, callback) {

    return function () {
        var aoisCoordinate = context.aoi;
        var index = context.index;

        var aoi = aoisCoordinate[index];
        var width = aoi.xmax - aoi.xmin;
        var height = aoi.ymax - aoi.ymin;

        gm('public/images/paper.png').crop(width, height, aoi.xmin, aoi.ymin)
            .write('public/images/AOI' + aoi.id + '.png', function (err) {
                if (err) {
                    console.log(JSON.stringify(err));
                }
                if (index < aoisCoordinate.length - 1) {
                    context.index += 1;
                    cropImageClosure(context, callback)();
                } else {
                    callback();
                }
            });
    }
}

function ocrClosure(context, callback) {

    return function() {
        var aoisCoordinate = context.aoi;
        var client = context.client;
        var index = context.index;

        var aoi = aoisCoordinate[index];
        var image = rf.readFileSync('public/images/AOI' + aoi.id + '.png');
        var base64Img = new Buffer(image).toString('base64');

        client.generalBasic(base64Img).then(function(result) {
            var count = tfidfWordCount(result);
            context.tfidfCount.push({'aoiID' : aoi.id, 'count' : count});

            if (index < aoisCoordinate.length - 1) {
                context.index = index + 1;
                ocrClosure(context, callback)();
            } else {
                var gazeData = gazeDataAnalyse(aoisCoordinate);
                context.res.send({gazeData : gazeData, keywordsCount : context.tfidfCount});
            }
        });
    }
}

function tfidfWordCount(result) {
    var words_reuslt = result.words_result;
    var text = "";
    words_reuslt.forEach(function (element) {
       text += element.words + " ";
    });
    var words = text.split(/[\s\-_():.!?,;\[\]\d]+/);

    var words_tfidf = caculateTfidf(20);
    var words_tfidf_dict = [];
    words_tfidf.forEach(function (element) {
       words_tfidf_dict[element.term] = element.tfidf;
    });
    var count = 0;
    words.forEach(function (word) {
        if (word in words_tfidf_dict)
            ++count;
    });
    return count;
}

function initOcrClient() {
    // 设置APPID/AK/SK
    var APP_ID = "9753076";
    var API_KEY = "BW3b1KoXx0wf8wFL4qUkhpWv";
    var SECRET_KEY = "G0uGUGfuMgefPr0dEIPkS0LPaWb32GRx";
    return new AipOcr(APP_ID, API_KEY, SECRET_KEY);
}


function caculateTfidf(top) {

    var doc = rf.readFileSync("public/data/test_en0.txt", "utf-8").toString();
    var corpus = rf.readFileSync("public/data/corpus_data.txt", "utf-8").toString();
    var stopWords = rf.readFileSync('public/data/stop_words.txt', 'utf-8').toString().split(/\s+/);

    var analyzer = tfidf.analyze(corpus, stopWords);

    var words_tfidf = analyzer.tfidf(doc);

    words_tfidf.sort(function (w1, w2) {
        return w2.tfidf - w1.tfidf;
    });
    return words_tfidf.slice(0, top);
}

function gazeDataAnalyse(aoisCoordinate) {
    var fixationDataArr = syncLoadCSV();
    var aoiUtils = new AoiUtils();
    var readSpeed = aoiUtils.caculateReadSpeed(fixationDataArr, aoisCoordinate);
    var readCount = aoiUtils.caculateReadCount(fixationDataArr, aoisCoordinate, 500, 500);
    var switchCount = aoiUtils.caculateSwitchCount(fixationDataArr, aoisCoordinate, 500);
    return {'readSpeed': readSpeed, 'readCount': readCount, 'switchCount': switchCount};
}

router.get('/generate_corpus', function(req, res) {
    var corpus0 = rf.readFileSync("public/data/corpus0.txt", "utf-8").toString();
    var corpus1 = rf.readFileSync("public/data/corpus1.txt", "utf-8").toString();
    var corpus2 = rf.readFileSync("public/data/corpus2.txt", "utf-8").toString();
    var corpus3 = rf.readFileSync("public/data/corpus3.txt", "utf-8").toString();
    var corpus4 = rf.readFileSync("public/data/corpus4.txt", "utf-8").toString();
    var corpus5 = rf.readFileSync("public/data/corpus5.txt", "utf-8").toString();
    var corpus6 = rf.readFileSync("public/data/corpus6.txt", "utf-8").toString();
    var corpus7 = rf.readFileSync("public/data/corpus7.txt", "utf-8").toString();
    var corpus8 = rf.readFileSync("public/data/corpus8.txt", "utf-8").toString();
    var corpus9 = rf.readFileSync("public/data/corpus9.txt", "utf-8").toString();
    var corpus10 = rf.readFileSync("public/data/corpus10.txt", "utf-8").toString();
    var stopWords = rf.readFileSync('public/data/stop_words.txt', 'utf-8').toString().split(/\s+/);
    var analyzer = tfidf.analyze([corpus0, corpus1, corpus2, corpus3, corpus4,
                                    corpus5, corpus6, corpus7, corpus8, corpus9, corpus10], stopWords);
    rf.writeFileSync("public/data/corpus_data.txt", analyzer.asJSON(), "utf-8");
    res.send('语料库生成成功!');
});

module.exports = router;
