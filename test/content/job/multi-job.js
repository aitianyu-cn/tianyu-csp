/** @format */

const { ObjectHelper } = require("@aitianyu.cn/types");
const { workerData, parentPort } = require("worker_threads");

setTimeout(() => {
    parentPort?.postMessage({ data: workerData.payload.id });

    process.exit(10);
}, workerData.payload.time);
