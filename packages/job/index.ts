/**
 * @format
 * @internal
 *
 * Export for job apis
 */

import { ICSPContributorFactorProtocolMap, JobManagerOptions } from "#interface";
import { IContributor } from "@aitianyu.cn/tianyu-app-fwk";
import { guid } from "@aitianyu.cn/types";
import { JobManager } from "./JobManager";

export * from "./JobManager";
export * from "./JobRunner";
export * from "./JobWorker";

/**
 * To create a new job manager instance from giving option
 *
 * @param options job manager option
 * @returns return a job manager instance
 */
export function createJobManager(
    options?: JobManagerOptions,
    contributor?: IContributor<ICSPContributorFactorProtocolMap>,
): string {
    const id = options?.id || guid();
    new JobManager(
        {
            limitWorkers: options?.limitWorkers,
            overtime: options?.overtime,
            id,
        },
        contributor,
    );

    return id;
}
