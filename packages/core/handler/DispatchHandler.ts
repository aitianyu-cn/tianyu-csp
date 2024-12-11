/** @format */

import {
    DISPATCH_HANDLER_MODULE_ID,
    DispatcherTriggerType,
    DispatchHandlerOption,
    IJobManager,
    JobExecutionResult,
    NetworkServiceResponseData,
    RequestPayloadData,
} from "#interface";
import { JobManager } from "#job/JobManager";

const DEFAULT_MAX_JOB_COUNT = 1024;

export class DispatchHandler {
    private _jobMgr: IJobManager;

    public constructor(options?: DispatchHandlerOption) {
        this._jobMgr = new JobManager({
            limitWorkers: options?.limitWorkers || DEFAULT_MAX_JOB_COUNT,
            handler: this._jobHandler.bind(this),
        });

        // create endpoints
        TIANYU.fwk.contributor.registerEndpoint("dispatch-handler.dispatcher");

        // export execution module
        TIANYU.fwk.contributor.exportModule("dispatch-handler.dispatcher", DISPATCH_HANDLER_MODULE_ID, this._dispatch.bind(this));
    }

    private async _dispatch(
        payload: RequestPayloadData & { trigger: DispatcherTriggerType },
    ): Promise<NetworkServiceResponseData> {}
}
