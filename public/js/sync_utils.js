function Sync() {

    this.execute = function (funcs, argvsList) {
        var executeAble = executeHelper(funcs, argvsList);
        executeAble();
    }

    function executeHelper(funcs, argvsList) {
        if (funcs.length === 1) {
            return funcs[0](argvsList[0], function() {});
        } else {
            return funcs[0](argvsList[0], executeHelper(funcs.slice(1), argvsList.slice(1)));
        }
    }
}

var sync = new Sync();
module.exports = sync;