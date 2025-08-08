/** @format */

import { parentPort, workerData } from "worker_threads";
import { run_network_request } from "./NetworkRunnerImpl";

/* istanbul ignore next */
run_network_request(workerData, parentPort).catch(() => {
    //
});
