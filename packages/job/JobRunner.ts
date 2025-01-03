/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import { IJobWorker, JobWorkerExecutionResult, JobWorkerPayload } from "#interface";

/**
 * @internal
 *
 * Job Runner Payload data
 */
export interface JobRunnerPayload {
    /** job running script */
    script: string;
    /** job worker payload data */
    payload: JobWorkerPayload;
    /** job execution id */
    executionId: string;
    /** job execution overtime */
    overtime: number;
    /** job execution promise resolve function */
    resolve: (value: JobWorkerExecutionResult) => void;
}

/**
 * @internal
 *
 * Job Runner
 */
export class JobRunner {
    private _worker: IJobWorker;
    private _queue: JobRunnerPayload;

    private _released: boolean;
    private _timer: NodeJS.Timeout | null;

    private _result: JobWorkerExecutionResult;

    public constructor(worker: IJobWorker, queue: JobRunnerPayload) {
        this._worker = worker;
        this._queue = queue;

        this._released = false;
        this._timer = null;
        this._result = { exitCode: 0, value: undefined, error: [], status: "active" };
    }

    /** To start a worker thread and execute script */
    public async run(): Promise<void> {
        this._timer = setTimeout(this.timeoutHandler.bind(this), this._queue.overtime);
        await this._worker.run(this._queue.script, this._queue.payload, this._queue.executionId).catch((error) => {
            TIANYU.logger.error(error?.message || "Technical error occurs.");
        });

        if (this._timer /** clean timer if timer is running */) {
            clearTimeout(this._timer); // clean timer
            this._timer = null;
        }

        if (!this._released /** if the worker is not resolved by timer */) {
            this._released = true;

            this._prepareJobResult(); // prepare job execution result
            this._queue.resolve(this._result); // return value by worker
        }
    }

    /** Watcher dog for checking job running timeout */
    public async timeoutHandler(): Promise<void> {
        if (this._released) {
            return;
        }

        this._timer = null;
        this._released = true; // to release job

        // to clean data
        await this._worker.terminate().catch((error) => {
            TIANYU.logger.error(error?.message || "Technical error occurs.");
        });

        this._result.status = "timeout";
        this._result.error.push({
            code: SERVICE_ERROR_CODES.JOB_EXECUTION_TIMEOUT,
            message: `Job ${this._worker.executionId} ran not done over ${this._queue.overtime / 1000} seconds`,
            traceId: this._queue.payload.traceId,
        });

        // if timeout, to resolve the outer promise
        this._queue.resolve(this._result); // return value by timer
    }

    /** To prepare the job execution result */
    private _prepareJobResult(): void {
        this._result.status = this._worker.status;
        this._result.exitCode = this._worker.exitCode;
        this._result.value = this._worker.value?.data;
        this._result.error = [
            ...(this._worker.error
                ? /* istanbul ignore next */ [
                      {
                          code: SERVICE_ERROR_CODES.INTERNAL_ERROR,
                          message: this._worker.error,
                      },
                  ]
                : []),
            ...(this._worker.value?.error || []),
        ];
    }
}
