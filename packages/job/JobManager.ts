/** @format */

import { IJobWorker, JobManagerOptions, JobWorkerExecutionResult, JobWorkerOptions } from "#interface";
import { guid } from "@aitianyu.cn/types";
import { JobWorker } from "./JobWorker";
import { Mutex } from "async-mutex";

export class JobManager {
    private _options: JobManagerOptions;

    private _mutex: Mutex;
    private _counter: number;
    private _waitingQueue: {
        script: string;
        options: JobWorkerOptions;
        executionId: string;
        resolve: Function;
        reject: Function;
    }[];

    public constructor(options: JobManagerOptions) {
        this._options = options;

        this._mutex = new Mutex();
        this._counter = 0;
        this._waitingQueue = [];

        TIANYU.fwk.contributor.registerEndpoint("job-manager.dispatch");
        TIANYU.fwk.contributor.exportModule("job-manager.dispatch", this._options.id || guid(), this._dispatch.bind(this));
    }

    private async _dispatch(payload: { script: string; options: JobWorkerOptions }): Promise<JobWorkerExecutionResult> {
        return new Promise<JobWorkerExecutionResult>((resolve, reject) => {
            const executionId = guid();

            this._mutex.acquire().then((release) => {
                this._waitingQueue.push({
                    resolve,
                    reject,
                    executionId,
                    script: payload.script,
                    options: { ...payload.options },
                });

                // release current thread and to dispatch job async.
                setTimeout(() => {
                    this._dispatchInternal();
                }, 0);

                // release lock
                release();
            }, reject);
        });
    }

    private createWorker(): IJobWorker | null {
        if (this._counter >= this._options.limitWorkers) {
            return null;
        }

        const worker = new JobWorker();
        return worker;
    }
    private _dispatchInternal(): void {
        this._mutex.acquire().then(
            (release) => {
                if (!this._waitingQueue.length) {
                    release();
                    return;
                }

                const worker = this.createWorker();
                if (!worker) {
                    release();
                    return;
                }

                // to skip the type checking due to the queue DOES NOT be empty
                const { script, options, executionId, resolve, reject } = this._waitingQueue.shift() as any;
                release();

                // to start a job
                worker
                    .run(script, options, executionId)
                    .then(resolve, reject)
                    // to start a next job
                    .finally(() => this._dispatchInternal());
            },
            (reason) => {
                TIANYU.logger.error(reason?.message || "Technical error occurs.", true);
            },
        );
    }
}
