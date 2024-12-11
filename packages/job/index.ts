/** @format */

import { JobManagerOptions } from "#interface";
import { guid } from "@aitianyu.cn/types";
import { JobManager } from "./JobManager";

export * from "./JobManager";
export * from "./JobWorker";

export const DEFAULT_MAX_JOB_COUNT = 1024;

export function createJobManager(options?: JobManagerOptions): string {
    const id = options?.id || guid();
    new JobManager({
        limitWorkers: options?.limitWorkers || DEFAULT_MAX_JOB_COUNT,
        id,
    });

    return id;
}
