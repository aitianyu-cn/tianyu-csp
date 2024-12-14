/** @format */

// import { ObjectHelper } from "@aitianyu.cn/types";
// import { workerData, parentPort } from "worker_threads";

const { ObjectHelper } = require("@aitianyu.cn/types");
const { workerData, parentPort } = require("worker_threads");

const data = ObjectHelper.clone(workerData.payload);
data["ret"] = "success";
parentPort?.postMessage({ data });

process.exit(10);
