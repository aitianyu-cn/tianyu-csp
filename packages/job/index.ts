/** @format */

import { JobManagerOptions } from "#interface";
import { guid } from "@aitianyu.cn/types";
import { JobManager } from "./JobManager";

export * from "./JobManager";
export * from "./JobWorker";

export function createJobManager(options?: JobManagerOptions): string {
    const id = options?.id || guid();
    new JobManager({
        limitWorkers: options?.limitWorkers,
        id,
    });

    return id;
}
