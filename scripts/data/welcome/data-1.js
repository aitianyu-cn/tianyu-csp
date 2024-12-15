/** @format */

module.exports.default = () => {
    // const body = TIANYU.import("data", "info");
    return {
        body: {
            application: "Tianyu CSP Example",
            url: TIANYU.request.url,
            data: "data-1",
        },
        headers: {},
    };
};
