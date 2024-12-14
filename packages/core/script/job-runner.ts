/** @format */

import { workerData, parentPort } from "worker_threads";
import { run_job_scripts } from "./JobRunnerImpl";

/* istanbul ignore next */
run_job_scripts(workerData, parentPort).catch(() => {});
