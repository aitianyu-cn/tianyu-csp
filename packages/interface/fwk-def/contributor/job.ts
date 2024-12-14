/** @format */

import { MapOfString, MapOfType } from "@aitianyu.cn/types";
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

export interface JobWorkerExecutionEntry {
    package: string;
    module: string;
    method: string;
}

export interface JobWorkerPayload extends JobWorkerExecutionEntry {
    options: JobWorkerOptions;
    traceId?: string;
}

export interface JobWorkerMessageValue {
    data: any;
    error: OperationError[];
}
