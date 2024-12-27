/** @format */

module.exports = function () {
    return "DEFAULT_RETURN";
};

module.exports.success = function () {
    return "SUCCESS";
};

module.exports.failed = function () {
    throw "FAILED";
};

module.exports.noreturn = function () {};

module.exports.isdata = "TEST_DATA";
