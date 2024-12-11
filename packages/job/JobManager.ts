/** @format */

import {
    IJobManager,
    IJobWorker,
    IJobWorkerManager,
    JobExecutionResult,
    JobManagerOptions,
    JobWorkerExecutionResult,
    JobWorkerOptions,
} from "#interface";
import { guid } from "@aitianyu.cn/types";
import { JobWorker } from "./JobWorker";
import { Mutex } from "async-mutex";

export class JobManager implements IJobManager, IJobWorkerManager {
    private _options: JobManagerOptions;

    private _mutex: Mutex;
    private _counter: number;
    private _waitingQueue: { script: string; options: JobWorkerOptions; executionId: string }[];

    public constructor(options: JobManagerOptions) {
        this._options = options;

        this._mutex = new Mutex();
        this._counter = 0;
        this._waitingQueue = [];

        TIANYU.fwk.contributor.registerEndpoint("job-manager.dispatch");
        TIANYU.fwk.contributor.exportModule("job-manager.dispatch", this._options.id, this._dispatch.bind(this));
    }

    private async _dispatch(payload: { script: string; options: JobWorkerOptions }): Promise<{}> {
        return new Promise<{}>((resolve, reject) => {
            const executionId = guid();

            this._mutex.acquire().then((release) => {
                this._waitingQueue.push({ executionId, script: payload.script, options: { ...payload.options } });

                // release current thread and to dispatch job async.
                setTimeout(() => {
                    this.toDispatch();
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
    private async _dispatchInternal(): Promise<JobWorkerExecutionResult> {
        const release = await this._mutex.acquire();
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
        const { script, options, executionId } = this._waitingQueue.shift() as any;
        release();

        // to start a job
        return worker.run(script, options, executionId);
    }
}
