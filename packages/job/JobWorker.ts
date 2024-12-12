/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import {
    IJobWorker,
    JobExecutionStatus,
    JobWorkerExecutionEntry,
    JobWorkerExecutionResult,
    JobWorkerMessageValue,
    JobWorkerPayload,
} from "#interface";
import { guid } from "@aitianyu.cn/types";
import { Worker } from "worker_threads";

export class JobWorker implements IJobWorker {
    private _id: string;
    private _worker: Worker | null;
    private _status: JobExecutionStatus;

    private _executionId: string;
    private _exitCode: number;
    private _returnValue: JobWorkerMessageValue | null;
    private _error: string;

    public constructor() {
        this._id = guid();

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

    public async run(script: string, payload: JobWorkerPayload, executionId?: string): Promise<JobWorkerExecutionResult> {
        if (this._status === "invalid" || this._worker) {
            return Promise.reject(new Error("Job execution failed!!!"));
        }

        return new Promise<JobWorkerExecutionResult>((resolve, rejects) => {
            try {
                // create a new execution id for each job.
                this._executionId = executionId || guid();

                const argv = payload.options.argv;
                const env = payload.options.env;
                const data = payload.options.workerData;
                const entry: JobWorkerExecutionEntry = {
                    package: payload.package,
                    module: payload.module,
                    method: payload.method,
                };
                this._worker = new Worker(script, {
                    argv,
                    env,
                    workerData: {
                        payload: data,
                        script: entry,
                    },
                });

                this._worker.on("error", (error: Error) => {
                    this._status = "error";
                    this._error = error.message;
                });
                this._worker.on("message", (value: JobWorkerMessageValue) => {
                    this._returnValue = value;
                });
                this._worker.on("exit", (exitCode: number) => {
                    // only set to done if the pre-status is running
                    // other cases mean the job execution not fully succesed.
                    this._status = this._status === "running" ? "done" : this._status;
                    this._exitCode = exitCode;

                    const result: JobWorkerExecutionResult = {
                        exitCode: this._exitCode === 1 ? Number(SERVICE_ERROR_CODES.INTERNAL_ERROR) : this._exitCode,
                        value: this.value?.data,
                        error: [
                            {
                                code: SERVICE_ERROR_CODES.INTERNAL_ERROR,
                                message: this._error,
                            },
                            ...(this.value?.error || []),
                        ],
                    };

                    resolve(result);
                });

                this._status = "running";
            } catch (e) {
                this._status = "invalid";
                rejects(typeof e === "string" ? new Error(e) : e);
            }
        });
    }

    public get exitCode(): number {
        return this._exitCode;
    }

    public get value(): JobWorkerMessageValue | null {
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
