/** @format */

import {
    DISPATCH_HANDLER_MODULE_ID,
    DispatchHandlerOption,
    JobWorkerExecutionResult,
    JobWorkerPayload,
    NetworkServiceResponseData,
    RequestPayloadData,
    RequestRestData,
} from "#interface";
import { createJobManager } from "#job/index";
import { RestHelper } from "#utils/RestHelper";
import { ObjectHelper } from "@aitianyu.cn/types";
import path from "path";

export class DispatchHandler {
    private _requestJobPool: string;
    private _scheduleJobPool: string;

    public constructor(options?: DispatchHandlerOption) {
        this._requestJobPool = createJobManager({ limitWorkers: options?.limitRequestsWorkers });
        this._scheduleJobPool = createJobManager({ limitWorkers: options?.limitScheduleWorkers });

        // create endpoints
        TIANYU.fwk.contributor.registerEndpoint("dispatch-handler.network-dispatcher");
        TIANYU.fwk.contributor.registerEndpoint("dispatch-handler.job-dispatcher");

        // export execution module
        TIANYU.fwk.contributor.exportModule(
            "dispatch-handler.network-dispatcher",
            DISPATCH_HANDLER_MODULE_ID,
            this._networkDispatch.bind(this),
        );
        TIANYU.fwk.contributor.exportModule(
            "dispatch-handler.job-dispatcher",
            DISPATCH_HANDLER_MODULE_ID,
            this._jobDispatch.bind(this),
        );
    }

    private async _networkDispatch(data: {
        rest: RequestRestData;
        payload: RequestPayloadData;
    }): Promise<NetworkServiceResponseData> {
        const dispatcher = TIANYU.fwk.contributor.findModule("job-manager.dispatch", this._requestJobPool);
        if (!dispatcher) {
            return Promise.reject(new Error());
        }

        const { exitCode, value, error } = await dispatcher({
            script: path.resolve(__dirname, "../script/network-runner.js"),
            payload: {
                ...data.rest,
                options: {
                    workerData: data.payload,
                },
            },
        });

        if (error) {
            return Promise.reject({ code: exitCode, message: error });
        } else {
            return value;
        }
    }

    private async _jobDispatch(payload: JobWorkerPayload): Promise<JobWorkerExecutionResult> {
        const dispatcher = TIANYU.fwk.contributor.findModule("job-manager.dispatch", this._scheduleJobPool);
        if (!dispatcher) {
            return Promise.reject(new Error());
        }
        const { exitCode, value, error } = await dispatcher({
            payload,
            script: path.resolve(__dirname, "../script/job-runner.js"),
        });

        if (error) {
            return Promise.reject({ code: exitCode, message: error });
        } else {
            return value;
        }
    }
}
