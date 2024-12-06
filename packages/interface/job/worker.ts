/** @format */

import { MapOfString } from "@aitianyu.cn/types";

export type JobExecutionStatus = "active" | "invalid" | "running" | "done" | "error";

export interface JobExecutionResult {
    id: string;
    status: JobExecutionStatus;

    executionId: string;
    exitCode: number;
    value: any;
    error: string;
}

export interface IJobWorker extends JobExecutionResult {
    run(script: string, options: JobWorkerOptions, executionId?: string): void;
    reset(): void;
}

export interface JobWorkerOptions {
    argv?: any[] | undefined;
    env?: MapOfString;
    workerData?: any;
}
