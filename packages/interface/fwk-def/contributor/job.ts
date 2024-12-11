/** @format */

import { MapOfString } from "@aitianyu.cn/types";

/** Job worker exection options */
export interface JobWorkerOptions {
    /** environment argv use same as process.argv */
    argv?: any[] | undefined;
    /** environment config use same as process.env */
    env?: MapOfString;
    /** execution data */
    workerData?: any;
}

export interface JobWorkerExecutionResult {
    /** Job script exit code */
    exitCode: number;
    /** Job exection result data */
    value: any;
    /** Error message when job execution */
    error: string;
}
