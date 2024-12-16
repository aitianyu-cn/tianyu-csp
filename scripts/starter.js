/** @format */

const { TianyuCSP } = require("../dist/lib/index");

const app = TianyuCSP.app({
    http1: {
        host: "0.0.0.0",
        port: "8080",
        enablefallback: true,
    },
});

app();
