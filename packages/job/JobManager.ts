/** @format */

import { IJobManager, IJobWorker, IJobWorkerManager, JobExecutionResult, JobManagerOptions, JobWorkerOptions } from "#interface";
import { guid } from "@aitianyu.cn/types";
import { JobWorker } from "./JobWorker";

export class JobManager implements IJobManager, IJobWorkerManager {
    private _options: JobManagerOptions;

    private _workerMap: Map<string, IJobWorker>;
    private _waitingQueue: { script: string; options: JobWorkerOptions; executionId: string }[];

    private get _workerCount(): number {
        return this._workerMap.size;
    }

    public constructor(options: JobManagerOptions) {
        this._options = options;

        this._workerMap = new Map<string, IJobWorker>();
        this._waitingQueue = [];
    }

    public dispatch(script: string, options: JobWorkerOptions): string {
        const executionId = guid();

        this._waitingQueue.push({ executionId, script, options: { ...options } });

        // release current thread and to dispatch job async.
        setTimeout(() => {
            this.toDispatch();
        }, 0);

        return executionId;
    }

    public done(workerId: string): void {
        const worker = this._workerMap.get(workerId);
        if (worker) {
            const jobResult: JobExecutionResult = {
                id: worker.id,
                status: worker.status,

                executionId: worker.executionId,
                exitCode: worker.exitCode,
                value: worker.value,
                error: worker.error,
            };

            // to release current thread to avoid time-comsuming logic in current thread.
            // to quickly release the done job and to start a new job.
            setTimeout(() => {
                this._options.handler(jobResult);
            }, 0);
        }

        // whatever the status of previous logic, to remove this worker and to do the next dispatch.
        this.finishWorker(workerId);
        this.toDispatch();
    }

    private createWorker(): IJobWorker | null {
        if (this._workerCount >= this._options.limitWorkers) {
            return null;
        }

        const worker = new JobWorker(this);
        this._workerMap.set(worker.id, worker);

        return worker;
    }
    private finishWorker(workerId: string): void {
        this._workerMap.delete(workerId);
    }
    private toDispatch(): void {
        if (!this._waitingQueue.length) {
            return;
        }

        const worker = this.createWorker();
        if (!worker) {
            return;
        }

        // to skip the type checking due to the queue DOES NOT be empty
        const { script, options, executionId } = this._waitingQueue.shift() as any;

        // to start a job
        worker.reset();
        worker.run(script, options, executionId);
    }
}
