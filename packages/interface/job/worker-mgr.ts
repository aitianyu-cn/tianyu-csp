/** @format */

import { CallbackActionT } from "@aitianyu.cn/types";
import { JobExecutionResult, JobWorkerOptions } from "./worker";

export type JobStatusHandler = CallbackActionT<JobExecutionResult>;

export interface JobManagerOptions {
    limitWorkers: number;

    handler: JobStatusHandler;
}

export interface IJobManager {
    dispatch(script: string, options: JobWorkerOptions): string;
}

export interface IJobWorkerManager {
    done(workerId: string): void;
}
