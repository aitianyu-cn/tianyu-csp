/** @format */

import {
    ICSPContributorFactorProtocolMap,
    IJobWorker,
    JobManagerOptions,
    JobWorkerExecutionResult,
    JobWorkerPayload,
} from "#interface";
import { guid } from "@aitianyu.cn/types";
import { JobWorker } from "./JobWorker";
import { Mutex } from "async-mutex";
import { DEFAULT_JOB_OVERTIME, DEFAULT_MAX_JOB_COUNT, SERVICE_ERROR_CODES } from "#core/Constant";
import { JobRunner, JobRunnerPayload } from "./JobRunner";
import { IContributor } from "@aitianyu.cn/tianyu-app-fwk";

/**
 * @internal
 *
 * Tianyu CSP Job manager
 */
export class JobManager {
    /** csp framework extension contributor */
    private _contributor?: IContributor<ICSPContributorFactorProtocolMap>;

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
    private _waitingQueue: JobRunnerPayload[];

    public constructor(options: JobManagerOptions, contributor?: IContributor<ICSPContributorFactorProtocolMap>) {
        this._contributor = contributor;

        this._limitCount = options.limitWorkers || /* istanbul ignore next */ DEFAULT_MAX_JOB_COUNT;
        this._overtime = options.overtime || /* istanbul ignore next */ DEFAULT_JOB_OVERTIME;
        this._id = options.id || /* istanbul ignore next */ guid();

        this._mutex = new Mutex();
        this._counter = 0;
        this._waitingQueue = [];

        this._contributor?.registerEndpoint("job-manager.dispatch");
        this._contributor?.exportModule("job-manager.dispatch", this._id, this._dispatch.bind(this));
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
            const queue = valid && worker && this._waitingQueue.shift();

            releaseGetJob();

            if (!queue) {
                return;
            }

            this._counter++;

            const runner = new JobRunner(worker, queue);
            await runner.run();

            this._counter--;
            void this._dispatchInternal();
        } catch (reason: any) /* istanbul ignore next */ {
            TIANYU.logger.error(reason?.message || "Technical error occurs.");
        }
    }
}
