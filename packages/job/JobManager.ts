/** @format */

import { IJobWorker, JobManagerOptions, JobWorkerExecutionResult, JobWorkerPayload } from "#interface";
import { getBoolean, guid } from "@aitianyu.cn/types";
import { JobWorker } from "./JobWorker";
import { Mutex } from "async-mutex";
import { DEFAULT_JOB_OVERTIME, DEFAULT_MAX_JOB_COUNT, SERVICE_ERROR_CODES } from "#core/Constant";

export class JobManager {
    private _limitCount: number;
    private _overtime: number;
    private _id: string;

    private _mutex: Mutex;
    private _counter: number;
    private _waitingQueue: {
        script: string;
        payload: JobWorkerPayload;
        executionId: string;
        overtime: number;
        resolve: (value: JobWorkerExecutionResult) => void;
    }[];
    private _workersMap: Map<string, { time: number; worker: IJobWorker }>;

    public constructor(options: JobManagerOptions) {
        this._limitCount = options.limitWorkers || /* istanbul ignore next */ DEFAULT_MAX_JOB_COUNT;
        this._overtime = options.overtime || /* istanbul ignore next */ DEFAULT_JOB_OVERTIME;
        this._id = options.id || /* istanbul ignore next */ guid();

        this._mutex = new Mutex();
        this._counter = 0;
        this._waitingQueue = [];
        this._workersMap = new Map<string, { time: number; worker: IJobWorker }>();

        TIANYU.fwk.contributor.registerEndpoint("job-manager.dispatch");
        TIANYU.fwk.contributor.exportModule("job-manager.dispatch", this._id, this._dispatch.bind(this));
    }

    private async _dispatch(payload: { script: string; payload: JobWorkerPayload }): Promise<JobWorkerExecutionResult> {
        return new Promise<JobWorkerExecutionResult>((resolve) => {
            const executionId = guid();

            this._mutex.acquire().then(
                (release) => {
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
                            this._dispatchInternal();
                        },
                        0,
                    );
                },
                /* istanbul ignore next */
                (error) => {
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
                },
            );
        });
    }

    private createWorker(): IJobWorker | null {
        if (this._counter >= this._limitCount) {
            return null;
        }

        const worker = new JobWorker();
        return worker;
    }

    private _dispatchInternal(): void {
        this._mutex.acquire().then(
            (release) => {
                const valid = !!this._waitingQueue.length;
                const worker = valid && this.createWorker();
                const queue = getBoolean(valid && worker) && this._waitingQueue.shift();
                if (queue) {
                    this._counter++;
                }
                const shouldRun = valid && worker && queue;
                if (shouldRun) {
                    this._workersMap.set(worker.id, { time: Date.now(), worker });
                }
                release();

                if (!valid || !worker || !queue) {
                    return;
                }

                const result: JobWorkerExecutionResult = {
                    exitCode: 0,
                    value: undefined,
                    error: [],
                    status: "active",
                };

                let isWorkerReleased = false;
                const timer = setTimeout(() => {
                    /* istanbul ignore if */
                    if (isWorkerReleased) {
                        return;
                    }

                    isWorkerReleased = true; // to release job

                    // to clean data
                    worker
                        .terminate()
                        /* istanbul ignore next */
                        .catch(/* istanbul ignore next */ () => {}) // nothing to do due to there should not have exception.
                        .finally(() => {
                            result.status = "timeout";
                            result.error.push({
                                code: SERVICE_ERROR_CODES.JOB_EXECUTION_TIMEOUT,
                                message: `Job ${worker.executionId} ran not done over ${queue.overtime / 1000} seconds`,
                                traceId: queue.payload.traceId,
                            });

                            queue.resolve(result); // return value by timer
                            this._dispatchInternal(); // to start a next job
                        });
                }, queue.overtime);

                worker
                    .run(queue.script, queue.payload, queue.executionId)
                    /* istanbul ignore next */
                    .catch(/* istanbul ignore next */ () => {}) // nothing to do due to there should not have exception.
                    .finally(() => {
                        this._prepareJobResult(worker, result); // prepare job execution result

                        this._mutex
                            .acquire()
                            .then(
                                (release) => {
                                    if (!isWorkerReleased /** if the worker is not resolved by timer */) {
                                        clearTimeout(timer); // clean timer
                                        this._counter--; // release sits
                                    }
                                    release();
                                },
                                /* istanbul ignore next */
                                (reason) => {
                                    TIANYU.logger.error(reason?.message || "Technical error occurs.");
                                },
                            )
                            .finally(() => {
                                if (!isWorkerReleased /** if the worker is not resolved by timer */) {
                                    queue.resolve(result); // return value by worker
                                    this._dispatchInternal(); // to start a next job
                                }
                            });
                    });
            },
            /* istanbul ignore next */
            (reason) => {
                TIANYU.logger.error(reason?.message || "Technical error occurs.");
            },
        );
    }

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
