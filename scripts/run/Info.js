/** @format */

module.exports.execute = () => {
    const body = TIANYU.import("data", "info");
    return {
        body,
        headers: {},
    };
};
