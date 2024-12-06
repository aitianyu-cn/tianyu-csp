/** @format */

import { IJobWorker, IJobWorkerManager, JobExecutionStatus, JobWorkerOptions } from "#interface";
import { guid } from "@aitianyu.cn/types";
import { Worker } from "worker_threads";

export class JobWorker implements IJobWorker {
    private _id: string;
    private _worker: Worker | null;
    private _status: JobExecutionStatus;

    private _workerMgr: IJobWorkerManager;

    private _executionId: string;
    private _exitCode: number;
    private _returnValue: any;
    private _error: string;

    public constructor(workerMgr: IJobWorkerManager) {
        this._id = guid();

        this._workerMgr = workerMgr;

        this._status = "active";
        this._worker = null;

        this._executionId = "";
        this._exitCode = 0;
        this._returnValue = null;
        this._error = "";
    }

    public get id(): string {
        return this._id;
    }

    public get status(): JobExecutionStatus {
        return this._status;
    }

    public run(script: string, options: JobWorkerOptions, executionId?: string): void {
        if (this._status === "invalid" || this._worker) {
            return;
        }

        try {
            // create a new execution id for each job.
            this._executionId = executionId || guid();

            this._worker = new Worker(script, { ...options });

            this._worker.on("error", (error: Error) => {
                this._status = "error";
                this._error = error.message;
            });
            this._worker.on("message", (value: any) => {
                this._returnValue = value;
            });
            this._worker.on("exit", (exitCode: number) => {
                // only set to done if the pre-status is running
                // other cases mean the job execution not fully succesed.
                this._status = this._status === "running" ? "done" : this._status;
                this._exitCode = exitCode;

                // to call manager to done the process
                this._workerMgr.done(this.id);
            });

            this._status = "running";
        } catch {
            this._status = "invalid";

            // to async invoke the worker manager to end the job
            setTimeout(() => {
                // to call manager to done the process
                this._workerMgr.done(this.id);
            }, 0);
        }
    }

    public get exitCode(): number {
        return this._exitCode;
    }

    public get value(): any {
        return this._returnValue;
    }

    public get error(): string {
        return this._error;
    }

    public get executionId(): string {
        return this._executionId;
    }

    public reset(): void {
        this._status = "active";
        this._worker = null;

        this._executionId = "";
        this._exitCode = 0;
        this._returnValue = null;
        this._error = "";
    }
}
