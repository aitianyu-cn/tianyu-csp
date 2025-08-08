/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import { IJobWorker, JobExecutionStatus, JobWorkerExecutionEntry, JobWorkerMessageValue, JobWorkerPayload } from "#interface";
import { guid } from "@aitianyu.cn/types";
import { Worker } from "worker_threads";

/**
 * @internal
 *
 * Job worker thread
 */
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

    public async terminate(): Promise<void> {
        return this._worker?.threadId
            ? this._worker.terminate().then(
                  async () => Promise.resolve(),
                  async () => Promise.resolve(),
              )
            : Promise.resolve();
    }

    public async run(script: string, payload: JobWorkerPayload, executionId?: string): Promise<void> {
        if (this._status === "invalid" || this._worker) {
            return Promise.reject({
                message: "New job run failed, Preious job is in running or has fatal error.",
                code: this._status === "invalid" ? SERVICE_ERROR_CODES.PRE_JOB_INVALID : SERVICE_ERROR_CODES.PRE_JOB_RUNNING,
            });
        }

        return new Promise<void>((resolve) => {
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
                const workData: any = { payload: data, script: entry };
                // const isTypescript = /\.ts$/.test(script);
                // /* istanbul ignore if */
                // if (isTypescript) {
                //     workData["__filename"] = script;
                // }
                // this._worker = new Worker(isTypescript ? /* istanbul ignore next */ TS_PROXY_SCRIPT : script, {
                //     argv,
                //     env,
                //     workerData: workData,
                //     stdout: true,
                //     stderr: true,
                // });
                this._worker = new Worker(script, {
                    argv,
                    env,
                    workerData: workData,
                    stdout: true,
                    stderr: true,
                });

                this._worker.stdout.on("data", (d: any) => {
                    void TIANYU.audit.debug("job/worker", `JOB info ${this.id}: ${d}`);
                });
                this._worker.stderr.on("data", (d: any) => {
                    void TIANYU.audit.debug("job/worker", `JOB error ${this.id}: ${d}`);
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
                    resolve();
                });

                this._status = "running";
            } catch (e) {
                const workerTerminate = this._worker?.threadId ? this._worker.terminate() : Promise.resolve(0);
                workerTerminate
                    .catch(() => {
                        // there is nothing to do since should not have any error
                    })
                    .finally(() => {
                        this._exitCode = Number(SERVICE_ERROR_CODES.JOB_RUNNING_INITIAL_FAILED);
                        this._status = "invalid";
                        this._error = typeof e === "string" ? e : (e as any)?.message || "";
                        resolve();
                    });
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

    /**
     * To reset all data
     *
     * This is used for reuseable thread later
     */
    public reset(): void {
        this._status = "active";
        this._worker = null;

        this._executionId = "";
        this._exitCode = 0;
        this._returnValue = null;
        this._error = "";
    }
}
