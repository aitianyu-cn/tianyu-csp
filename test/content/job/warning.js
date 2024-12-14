/** @format */

const { ObjectHelper } = require("@aitianyu.cn/types");
const { workerData, parentPort } = require("worker_threads");

const data = ObjectHelper.clone(workerData.payload);
data["ret"] = "warning";
parentPort?.postMessage({
    data,
    error: [
        {
            code: "5000",
            message: "this is a warning",
        },
    ],
});

process.exit(20);
