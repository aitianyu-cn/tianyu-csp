/** @format */

import { CallbackActionT } from "@aitianyu.cn/types";
import { JobExecutionResult, JobWorkerOptions } from "./worker";

/** Job execution result handler. A function callback for result */
export type JobStatusHandler = CallbackActionT<JobExecutionResult>;

/** Job manager options */
export interface JobManagerOptions {
    /** the maximum workers count */
    limitWorkers: number;

    /** Job execution result callback */
    handler: JobStatusHandler;
}

/** Job manager expose API */
export interface IJobManager {
    /**
     * To dispatch a job
     *
     * @param script execution job script
     * @param options job execution option
     *
     * @returns return an execution id
     */
    dispatch(script: string, options: JobWorkerOptions): string;
}

/** Job manager API for job worker */
export interface IJobWorkerManager {
    /**
     * Job execution done callback
     *
     * @param workerId job worker id for the done job
     */
    done(workerId: string): void;
}
