/** @format */

const { TianyuCSP } = require("../dist/lib/index");

TianyuCSP.Infra.load();

console.log(TIANYU.environment);

const dispatcher = new TianyuCSP.Infra.DispatchHandler();
dispatcher.initialize();
const requestHandler = new TianyuCSP.Infra.RequestHandler();
requestHandler.initialize();

const http1 = new TianyuCSP.Infra.HttpService({
    host: "0.0.0.0",
    port: "8080",
});
http1.listen();
