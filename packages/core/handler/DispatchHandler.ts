/** @format */

import { DispatchHandlerOption, IDispatcherConsumer, IDispatchHandler, IJobManager, JobExecutionResult } from "#interface";
import { JobManager } from "#job/JobManager";

const DEFAULT_MAX_JOB_COUNT = 1024;

export class DispatchHandler implements IDispatchHandler {
    private _jobMgr: IJobManager;
    private _consumer: IDispatcherConsumer | null;

    public constructor(options?: DispatchHandlerOption) {
        this._consumer = null;
        this._jobMgr = new JobManager({
            limitWorkers: options?.limitWorkers || DEFAULT_MAX_JOB_COUNT,
            handler: this._jobHandler.bind(this),
        });
    }

    public bind(consumer: IDispatcherConsumer): void {
        this._consumer = consumer;
    }

    private _jobHandler(result: JobExecutionResult): void {}
}
