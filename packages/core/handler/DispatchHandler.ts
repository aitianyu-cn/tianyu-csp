/** @format */

import {
    DISPATCH_HANDLER_MODULE_ID,
    DispatcherTriggerType,
    DispatchHandlerOption,
    NetworkServiceResponseData,
    RequestPayloadData,
} from "#interface";
import { JobManager } from "#job/JobManager";
import { guid } from "@aitianyu.cn/types";

const DEFAULT_MAX_JOB_COUNT = 1024;

export class DispatchHandler {
    private _requestJobPool: string;
    private _scheduleJobPool: string;

    public constructor(options?: DispatchHandlerOption) {
        this._requestJobPool = guid();
        this._scheduleJobPool = guid();

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
