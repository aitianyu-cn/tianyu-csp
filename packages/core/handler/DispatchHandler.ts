/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import {
    DISPATCH_HANDLER_MODULE_ID,
    DispatchHandlerOption,
    HTTP_STATUS_CODE,
    JobWorkerExecutionResult,
    JobWorkerPayload,
    NetworkServiceResponseData,
    RequestPayloadData,
    RequestRestData,
} from "#interface";
import { createJobManager } from "#job/index";
import { ErrorHelper } from "#utils/ErrorHelper";
import path from "path";

export class DispatchHandler {
    private _options?: DispatchHandlerOption;

    private _requestJobPool: string;
    private _scheduleJobPool: string;

    public constructor(options?: DispatchHandlerOption) {
        this._options = options;
        this._requestJobPool = "";
        this._scheduleJobPool = "";

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

    public initialize(): void {
        this._requestJobPool = createJobManager({ limitWorkers: this._options?.limitRequestsWorkers });
        this._scheduleJobPool = createJobManager({ limitWorkers: this._options?.limitScheduleWorkers });
    }

    private async _networkDispatch(data: {
        rest: RequestRestData;
        payload: RequestPayloadData;
    }): Promise<NetworkServiceResponseData> {
        const dispatcher = TIANYU.fwk.contributor.findModule("job-manager.dispatch", this._requestJobPool);
        if (!dispatcher) {
            return Promise.reject({
                status: "error",
                error: ErrorHelper.getError(
                    HTTP_STATUS_CODE.SERVICE_UNAVAILABLE.toString(),
                    "error occurs when request processing.",
                    "network request could not be handled internally due to some technical errors.",
                ),
            });
        }

        const { exitCode, value, error, status } = await dispatcher({
            script: path.resolve(__dirname, "../script/network-runner.js"),
            payload: {
                ...data.rest,
                traceId: data.payload.traceId,
                options: {
                    env: process.env,
                    argv: process.argv,
                    workerData: data.payload,
                },
            },
        });

        if (error.length) {
            return Promise.reject({
                status,
                error: ErrorHelper.getError(exitCode.toString(), "error occurs when request processing.", JSON.stringify(error)),
            });
        } else {
            const result: NetworkServiceResponseData = {
                statusCode:
                    value?.statusCode === undefined
                        ? exitCode || HTTP_STATUS_CODE.NO_CONTENT
                        : value?.statusCode || HTTP_STATUS_CODE.OK,
                headers: value?.headers || {},
                body: value?.body || "",
            };
            return result;
        }
    }

    private async _jobDispatch(payload: JobWorkerPayload): Promise<JobWorkerExecutionResult> {
        const dispatcher = TIANYU.fwk.contributor.findModule("job-manager.dispatch", this._scheduleJobPool);
        if (!dispatcher) {
            const errorRes: JobWorkerExecutionResult = {
                exitCode: Number(SERVICE_ERROR_CODES.INTERNAL_ERROR),
                value: undefined,
                error: [
                    ErrorHelper.getError(
                        SERVICE_ERROR_CODES.JOB_RUNNING_INITIAL_FAILED,
                        "error occurs when job processing.",
                        "job could not be handled internally due to some technical errors (JobManager is not valid).",
                    ),
                ],
                status: "error",
            };
            return errorRes;
        }
        const result = await dispatcher({
            payload,
            script: path.resolve(__dirname, "../script/job-runner.js"),
        });

        return result;
    }
}
