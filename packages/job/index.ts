/**
 * @format
 * @internal
 *
 * Export for job apis
 */

import { JobManagerOptions } from "#interface";
import { guid } from "@aitianyu.cn/types";
import { JobManager } from "./JobManager";

export * from "./JobManager";
export * from "./JobWorker";

/**
 * To create a new job manager instance from giving option
 *
 * @param options job manager option
 * @returns return a job manager instance
 */
export function createJobManager(options?: JobManagerOptions): string {
    const id = options?.id || guid();
    new JobManager({
        limitWorkers: options?.limitWorkers,
        overtime: options?.overtime,
        id,
    });

    return id;
}
