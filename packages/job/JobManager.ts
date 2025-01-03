/** @format */

import { IJobWorker, JobManagerOptions, JobWorkerExecutionResult, JobWorkerPayload } from "#interface";
import { getBoolean, guid } from "@aitianyu.cn/types";
import { JobWorker } from "./JobWorker";
import { Mutex } from "async-mutex";
import { DEFAULT_JOB_OVERTIME, DEFAULT_MAX_JOB_COUNT, SERVICE_ERROR_CODES } from "#core/Constant";

/**
 * @internal
 *
 * Tianyu CSP Job manager
 */
export class JobManager {
    /** execution job threads limit count, default is 1024 */
    private _limitCount: number;
    /** job execution max waiting time, default is 300s */
    private _overtime: number;
    /** job mgr id */
    private _id: string;

    /** multi-threads mutex for operation jobs waiting list */
    private _mutex: Mutex;
    /** count of current running threads */
    private _counter: number;
    /** jobs waiting list */
    private _waitingQueue: {
        script: string;
        payload: JobWorkerPayload;
        executionId: string;
        overtime: number;
        resolve: (value: JobWorkerExecutionResult) => void;
    }[];

    public constructor(options: JobManagerOptions) {
        this._limitCount = options.limitWorkers || /* istanbul ignore next */ DEFAULT_MAX_JOB_COUNT;
        this._overtime = options.overtime || /* istanbul ignore next */ DEFAULT_JOB_OVERTIME;
        this._id = options.id || /* istanbul ignore next */ guid();

        this._mutex = new Mutex();
        this._counter = 0;
        this._waitingQueue = [];

        TIANYU.fwk.contributor.registerEndpoint("job-manager.dispatch");
        TIANYU.fwk.contributor.exportModule("job-manager.dispatch", this._id, this._dispatch.bind(this));
    }

    /**
     * To dispatch a job
     *
     * @param payload job execution payload and running script
     * @returns return a promise of the job
     */
    private async _dispatch(payload: { script: string; payload: JobWorkerPayload }): Promise<JobWorkerExecutionResult> {
        return new Promise<JobWorkerExecutionResult>(async (resolve) => {
            const executionId = guid();

            try {
                const release = await this._mutex.acquire();
                this._waitingQueue.push({
                    resolve,
                    executionId,
                    overtime: payload.payload.options.overtime || this._overtime,
                    script: payload.script,
                    payload: payload.payload,
                });

                release(); // release lock

                setTimeout(
                    (/** release current thread and to dispatch job async. */) => {
                        void this._dispatchInternal();
                    },
                    0,
                );
            } catch (error: any) /* istanbul ignore next */ {
                const result: JobWorkerExecutionResult = {
                    exitCode: Number(SERVICE_ERROR_CODES.INTERNAL_ERROR),
                    value: undefined,
                    error: [
                        {
                            code: SERVICE_ERROR_CODES.INTERNAL_ERROR,
                            message: "start job failed",
                            error: error?.message,
                        },
                    ],
                    status: "invalid",
                };
                resolve(result);
            }
        });
    }

    /**
     * To create a job worker if the threads of job manager is not full
     * @returns return a job worker if threads count is less than max, otherwise null
     */
    private createWorker(): IJobWorker | null {
        if (this._counter >= this._limitCount) {
            return null;
        }

        const worker = new JobWorker();
        return worker;
    }

    /**
     * To execute a job
     *
     * @returns return a promise without rejection
     */
    private async _dispatchInternal(): Promise<void> {
        try {
            const releaseGetJob = await this._mutex.acquire();

            const valid = !!this._waitingQueue.length;
            const worker = valid && this.createWorker();
            const queue = getBoolean(valid && worker) && this._waitingQueue.shift();
            if (queue) {
                this._counter++;
            }
            const shouldRun = valid && worker && queue;
            releaseGetJob();

            if (!shouldRun) {
                return;
            }

            await this._runJob(worker, queue);
        } catch (reason: any) /* istanbul ignore next */ {
            TIANYU.logger.error(reason?.message || "Technical error occurs.");
        }
    }

    private async _runJob(
        worker: IJobWorker,
        queue: {
            script: string;
            payload: JobWorkerPayload;
            executionId: string;
            overtime: number;
            resolve: (value: JobWorkerExecutionResult) => void;
        },
    ): Promise<void> {
        const result: JobWorkerExecutionResult = { exitCode: 0, value: undefined, error: [], status: "active" };

        let isWorkerReleased = false;
        const timer = setTimeout(async () => {
            /* istanbul ignore if */
            if (isWorkerReleased) {
                return;
            }

            isWorkerReleased = true; // to release job

            // to clean data
            await worker
                .terminate()
                /* istanbul ignore next */
                .catch(/* istanbul ignore next */ () => {}); // nothing to do due to there should not have exception.

            result.status = "timeout";
            result.error.push({
                code: SERVICE_ERROR_CODES.JOB_EXECUTION_TIMEOUT,
                message: `Job ${worker.executionId} ran not done over ${queue.overtime / 1000} seconds`,
                traceId: queue.payload.traceId,
            });

            queue.resolve(result); // return value by timer
            void this._dispatchInternal(); // to start a next job
        }, queue.overtime);

        await worker
            .run(queue.script, queue.payload, queue.executionId)
            /* istanbul ignore next */
            .catch(/* istanbul ignore next */ () => {}); // nothing to do due to there should not have exception.

        this._prepareJobResult(worker, result); // prepare job execution result

        const releaseCountDown = await this._mutex.acquire().catch(
            /* istanbul ignore next */
            (reason) => {
                TIANYU.logger.error(reason?.message || "Technical error occurs.");
                return null;
            },
        );
        if (!isWorkerReleased /** if the worker is not resolved by timer */) {
            clearTimeout(timer); // clean timer
            this._counter--; // release sits
        }
        releaseCountDown?.();

        if (!isWorkerReleased /** if the worker is not resolved by timer */) {
            queue.resolve(result); // return value by worker
            this._dispatchInternal(); // to start a next job
        }
    }

    /**
     * To prepare the job execution result
     *
     * @param worker the job worker instance
     * @param result the result instance which needs to be filled
     */
    private _prepareJobResult(worker: IJobWorker, result: JobWorkerExecutionResult): void {
        result.status = worker.status;
        result.exitCode = worker.exitCode;
        result.value = worker.value?.data;
        result.error = [
            ...(worker.error
                ? /* istanbul ignore next */ [
                      {
                          code: SERVICE_ERROR_CODES.INTERNAL_ERROR,
                          message: worker.error,
                      },
                  ]
                : []),
            ...(worker.value?.error || []),
        ];
    }
}
