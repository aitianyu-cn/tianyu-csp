/** @format */

const { TianyuCSP } = require("../dist/lib/index");

const starter = TianyuCSP.app({
    host: "0.0.0.0",
    port: "8080",
    enablefallback: true,
});

starter();
