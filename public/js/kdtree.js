function KdTree() {

    /** the root node of the tree */
    var root = null;

    /** num of node in the tree */
    var size = 0;

    /**
     * add the point to the set (if it is not already in the set)
     * @param point the point which add to the tree, it has 'x' and 'y' field member
     * represent to the coordinate
     */
    this.insert = function(point) {
        root = insertRecurse(root, point, 0);
    }

    /**
     * num of node in the tree
     * @returns {*}
     */
    this.size = function () {
        return size;
    }

    /**
     * all points that are inside the rectangle
     * @param rect the specified rectangle
     * @returns all the points inside the rectangle
     */
    this.range = function (rect) {
        return rangeRecurse(root, rect, 0);
    }

    /**
     * recursively range search the points in the rectangle
     * @param node current iteration of the node
     * @param rect the specified rectangle
     * @param depth current depth of the tree
     */
    function rangeRecurse(node, rect, depth) {
        var result = [];
        if (node != null) {
            var left = [];
            var right = [];
            if (rectContainsThePoint(rect, node.point)) {
                result.push(node.point);
            }
            if (isSplitRect(node, rect, depth)) {
                left = rangeRecurse(node.left, leftRect(rect, node.point, depth), depth + 1);
                right = rangeRecurse(node.right, rightRect(rect, node.point, depth), depth + 1);
            } else if (rectIsInLeft(node, rect, depth)) {
                left = rangeRecurse(node.left, rect, depth + 1);
            } else {
                right = rangeRecurse(node.right, rect, depth + 1);
            }
            addAll(result, left);
            addAll(result, right);
        }
        return result;
    }

    /**
     * split the rect and get the left part
     * @param rect
     * @param point the point which split the rect
     * @param depth
     * @returns {*}
     */
    function leftRect(rect, point, depth) {
        if (isEven(depth)) {
            return {'xmin' : rect.xmin, 'ymin' : rect.ymin, 'xmax' : point.x, 'ymax' : rect.ymax};
        }
        return {'xmin' : rect.xmin, 'ymin' : rect.ymin, 'xmax' : rect.xmax, 'ymax' : point.y};
    }

    /**
     * split the rect and get the right part
     * @param rect
     * @param point the point which split the rect
     * @param depth
     * @returns {*}
     */
    function rightRect(rect, point, depth) {
        if (isEven(depth)) {
            return {'xmin' : point.x, 'ymin' : rect.ymin, 'xmax' : rect.xmax, 'ymax' : rect.ymax};
        }
        return {'xmin' : rect.xmin, 'ymin' : point.y, 'xmax' : rect.xmax, 'ymax' : rect.ymax};
    }

    /**
     * recursively insert the point
     * @param node current iteration of the node
     * @param point the point which add to the tree
     * @param depth current depth of the tree
     */
    function insertRecurse(node, point, depth) {
        if (node == null) {
            node = new Node(point);
            ++size;
        } else if (pointEquals(node.point, point)) {
            return node;
        } else if (pointIsInLeft(node, point, depth)) {
            node.left = insertRecurse(node.left, point, depth + 1);
        } else {
            node.right = insertRecurse(node.right, point, depth + 1);
        }
        return node;
    }

    /**
     * compare two point only if their coordinate is equals
     * @param p1
     * @param p2
     * @returns {boolean}
     */
    function pointEquals(p1, p2) {
        return p1.x == p2.x && p1.y == p2.y;
    }


    /**
     * determine whether the point is in the left of the node
     * @param node
     * @param point
     * @param depth
     * @returns {*|boolean}
     */
    function pointIsInLeft(node, point, depth) {
        return (isEven(depth) && point.x <= node.point.x) || (isOdd(depth) && point.y <= node.point.y);
    }

    /**
     * determine whether the rectangle is in the left of the node
     * @param node
     * @param rect
     * @param depth
     * @returns {*|boolean}
     */
    function rectIsInLeft(node, rect, depth) {
        return (isEven(depth) && rect.xmax <= node.point.x || (isOdd(depth) && rect.ymax <= node.point.y));
    }

    /**
     * determine whether the point inside the rectangle
     * @param rect
     * @param point
     * @returns {boolean}
     */
    function rectContainsThePoint(rect, point) {
        return (point.x >= rect.xmin) && (point.x <= rect.xmax)
            && (point.y >= rect.ymin) && (point.y <= rect.ymax);
    }

    /**
     * determine whether the point of the node split the rectangle
     * @param node
     * @param rect
     * @param depth
     * @returns {boolean}
     */
    function isSplitRect(node, rect, depth) {
        var x = node.point.x;
        var y = node.point.y;
        return (isEven(depth)) ? (rect.xmin <= x && rect.xmax >= x) : (rect.ymin <= y && rect.ymax >= y);
    }

    /**
     * add all the element which in the subArray to the mainArray
     * @param mainArray
     * @param subArray
     */
    function addAll(mainArray, subArray) {
        for (var i = 0; i < subArray.length; i++) {
            mainArray.push(subArray[i]);
        }
    }

    function isEven(num) {
        return num % 2 == 0;
    }

    function isOdd(num) {
        return !isEven(num);
    }

    /**
     * represent an element of the tree, which include a point,
     * the reference of left and right subTree
     * @param point
     * @constructor
     */
    function Node(point) {
        this.point = point;
        this.left = null;
        this.right = null;
    }
}

module.exports = KdTree;

