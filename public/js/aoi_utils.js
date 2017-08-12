var KdTree = require('./kdtree');

function AoiUtils() {

    /**
     * 返回每个aoi的阅读速度
     * @param points 所有的point
     * @param aois 所有的aoi
     * @return {Array}
     */
    this.caculateReadSpeed = function (points, aois) {

        points = points.map(function (point) {
            return {'x': point.fixationX, 'y': point.fixationY, 'duration': point.duration};
        });

        var aoiRangePoints = [];    //获取每个aoi对应的point
        var kdTree = new KdTree();
        points.forEach(function (point) {
            kdTree.insert(point);
        });
        console.log(typeof aois);
        aois.forEach(function(aoi) {
            aoiRangePoints.push({'aoiID': aoi.id, 'points': kdTree.range(aoi)});
        });

        //对每个aoi的point按照point的时间排序
        aoiRangePoints.forEach(function (element) {
            element.points.sort(function (pointA, pointB) {
                return pointA.sequence - pointB.sequence;
            });
        });

        var result = [];

        aoiRangePoints.forEach(function (element) {
            var aoiID = element.aoiID;
            var points = element.points;
            if (points.length > 0) {
                var prevPoint = points[0];
                var totalDuration = prevPoint.duration;
                var totalDistance = 0;

                for (var i = 1; i < points.length; i++) {
                    var point = points[i];
                    totalDistance += Math.sqrt(Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2));
                    totalDuration += point.duration;
                    prevPoint = point;
                }
                result.push({'aoiID': aoiID, 'speed': totalDistance / totalDuration});
            }
        });

        return result;

    }


    /**
     * 每个AOI的阅读次数
     * @param points 所有的注视点
     * @param aois 所有的AOI
     * @param leaveThreshold 离开当前AOI的时间阈值
     * @param stayThreshold 在当前AOI的驻留时间
     * @return {Array}
     */

    this.caculateReadCount = function (points, aois, leaveThreshold, stayThreshold) {
        points = points.map(function (point) {
            return {'x': point.fixationX, 'y': point.fixationY, 'duration': point.duration};
        });
        var aoisTimeInfo = new Array(aois.length);
        var result = new Array(aois.length);
        aois.forEach(function (aoi) {
            aoisTimeInfo[aoi.id - 1] = {'leave': Infinity, 'stay': 0};
            result[aoi.id - 1] = 0;
        });

        points.forEach(function (point) {
            var aoiID = findAoiByPoint(aois, point);
            jump(point, aoiID, aoisTimeInfo, result, leaveThreshold, stayThreshold);
        });
        result = result.map(function (element, index) {
            return {'aoiID': index + 1, 'count': element};
        });
        return result;
    };


    function jump(targetPoint, targetAoiID, aoisTimeInfo, result, leaveThreshold, stayThreshold) {

        for (var i = 0; i < aoisTimeInfo.length; i++) {
            var aoiID = i + 1;
            if (targetAoiID == aoiID) {
                aoisTimeInfo[i].stay += targetPoint.duration;
                if (isReturnTheAoi(aoisTimeInfo[aoiID - 1].leave, aoisTimeInfo[aoiID - 1].stay, leaveThreshold, stayThreshold)) {
                    result[i]++;
                }
                if (aoisTimeInfo[i].leave != Infinity || aoisTimeInfo[i].stay >= stayThreshold) {
                    aoisTimeInfo[i].leave = 0;
                }
            } else {
                aoisTimeInfo[i].leave += targetPoint.duration;
                aoisTimeInfo[i].stay = 0;
            }
        }
    }

    function isReturnTheAoi(leave, stay, leaveThreshold, stayThreshold) {
        return leave >= leaveThreshold && stay >= stayThreshold;
    }

    function findAoiByPoint(aois, point) {
        for (var i = 0; i < aois.length; i++) {
            var aoi = aois[i];
            if (point.x >= aoi.xmin && point.x <= aoi.xmax && point.y >= aoi.ymin && point.y <= aoi.ymax) {
                return aoi.id;
            }
        }
    }


    /**
     * AOI的阅读转换次数
     * @param points 所有的注视点
     * @param aois 所有的AOI
     * @param stayThreshold 在目标AOI停留的时间
     */
    this.caculateSwitchCount = function (points, aois, stayThreshold) {
        var result = [];
        points = points.map(function (point) {
            return {'x': point.fixationX, 'y': point.fixationY, 'duration': point.duration};
        });

        var stayTimeInfo = new Array(aois.length);
        aois.forEach(function (aoi) {
            stayTimeInfo[aoi.id - 1] = 0;
        });

        var prevAoiID;
        var index = 0;
        for (; index < points.length; index++) {
            prevAoiID = findAoiByPoint(aois, points[index]);
            if (prevAoiID) {
                stayTimeInfo[prevAoiID] += points[index].duration;
                break;
            }
        }

        for (index = index + 1; index < points.length; index++) {
            var point = points[index];
            var targetAoiID = findAoiByPoint(aois, point);
            if (targetAoiID) {
                switchAOI(prevAoiID, targetAoiID, point, stayTimeInfo, result, stayThreshold);
                if (prevAoiID != targetAoiID) {
                    prevAoiID = targetAoiID;
                }
            }
        }
        return statisticalSwitchCount(result);


    }

    function switchAOI(prevAoidID, targetAoiID, targetPoint, stayTimeInfo, result, stayThreshold) {

        for (var i = 0; i < stayTimeInfo.length; i++) {
            var aoiID = i + 1;
            if (targetAoiID == aoiID) {
                stayTimeInfo[i] += targetPoint.duration;
                if (prevAoidID != targetAoiID && stayTimeInfo[prevAoidID] >= stayThreshold && stayTimeInfo[targetAoiID] >= stayThreshold) {
                    result.push({'from': prevAoidID, 'to': targetAoiID});
                }
            } else {
                stayTimeInfo[i].stay = 0;
            }
        }
    }

    function statisticalSwitchCount(result) {
        var switchCount = {};
        result.forEach(function (element) {
            var key = element.from + "->" + element.to;
            if (!switchCount[key]) {
                switchCount[key] = 0;
            }
            ++switchCount[key];
        });
        return switchCount;

    }
}

module.exports = AoiUtils;










