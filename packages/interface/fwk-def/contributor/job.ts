/** @format */

import { MapOfType } from "@aitianyu.cn/types";
import { JobExecutionStatus, OperationError } from "#interface";

/** Job worker exection options */
export interface JobWorkerOptions {
    /** environment argv use same as process.argv */
    argv?: string[];
    /** environment config use same as process.env */
    env?: MapOfType<string | undefined>;
    /** execution data */
    workerData?: any;
    overtime?: number;
}

export interface JobWorkerExecutionResult {
    /** Job script exit code */
    exitCode: number;
    /** Job exection result data */
    value: any;
    /** Error message when job execution */
    error: OperationError[];
    status: JobExecutionStatus;
}

/** Job worker execution script package */
export interface JobWorkerExecutionEntry {
    /** package location */
    package: string;
    /** package module file name */
    module: string;
    /** package running method */
    method: string;
}

/** Job worker payload data */
export interface JobWorkerPayload extends JobWorkerExecutionEntry {
    /** job worker config option */
    options: JobWorkerOptions;
    /** trace id of job worker */
    traceId?: string;
}

/** job worker running message value */
export interface JobWorkerMessageValue {
    /** generic data */
    data: any;
    /** execution errors */
    error: OperationError[];
}
