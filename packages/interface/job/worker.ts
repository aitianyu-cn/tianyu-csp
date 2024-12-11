/** @format */

import { JobWorkerExecutionResult, JobWorkerOptions } from "../fwk-def/contributor/job";

/** Job Execution Status */
export type JobExecutionStatus = "active" | "invalid" | "running" | "done" | "error";

/** Job Execution Result */
export interface JobExecutionResult {
    /** Job Worker Id */
    id: string;
    /** Job Status when done */
    status: JobExecutionStatus;

    /** Job execution id */
    executionId: string;
    /** Job script exit code */
    exitCode: number;
    /** Job exection result data */
    value: any;
    /** Error message when job execution */
    error: string;
}

/** Job worker API */
export interface IJobWorker extends JobExecutionResult {
    /**
     * To start a script execution
     *
     * @param script script file fullpath with name or URI
     * @param options job execution options
     * @param executionId specified execution id
     */
    run(script: string, options: JobWorkerOptions, executionId?: string): Promise<JobWorkerExecutionResult>;
}
