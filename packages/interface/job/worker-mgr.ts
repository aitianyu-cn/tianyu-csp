/** @format */

import { CallbackActionT } from "@aitianyu.cn/types";
import { JobExecutionResult } from "./worker";

/** Job execution result handler. A function callback for result */
export type JobStatusHandler = CallbackActionT<JobExecutionResult>;

/** Job manager options */
export interface JobManagerOptions {
    /** the maximum workers count */
    limitWorkers: number;

    /** Job Manager id */
    id?: string;
}
