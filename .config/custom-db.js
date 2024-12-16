/** @format */

module.exports = [
    {
        database: "csp_sys",
        table: "logger",
        field: {
            user: { name: "user", type: "char", size: 45 },
            level: { name: "level", type: "tinyint", size: 3, default: "0" },
            time: { name: "time", type: "char", size: 45 },
            msg: { name: "msg", type: "text" },
        },
    },
];
