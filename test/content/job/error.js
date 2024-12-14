/** @format */

const { ObjectHelper } = require("@aitianyu.cn/types");
const { workerData, parentPort } = require("worker_threads");

const data = ObjectHelper.clone(workerData.payload);
data["ret"] = "error";
parentPort?.postMessage({
    data,
    error: [
        {
            code: "5000",
            message: "this is a error",
        },
    ],
});

throw new Error("error");
