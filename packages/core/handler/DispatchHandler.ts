/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import { findActualModule } from "#core/infra/ImporterManager";
import {
    DISPATCH_HANDLER_MODULE_ID,
    DispatchHandlerOption,
    HTTP_STATUS_CODE,
    ICSPContributorFactorProtocolMap,
    JobWorkerExecutionResult,
    JobWorkerPayload,
    NetworkServiceResponseData,
    PathEntry,
    RequestPayloadData,
} from "#interface";
import { createJobManager } from "#job";
import { ErrorHelper } from "#utils";
import { IContributor } from "@aitianyu.cn/tianyu-app-fwk/dist/types/interface/contributor";
import path from "path";

/**
 * Tianyu CSP Job Dispatch handler
 *
 * to dispatch network requests and schedule jobs in different threads
 */
export class DispatchHandler {
    private _contributor?: IContributor<ICSPContributorFactorProtocolMap>;
    private _options?: DispatchHandlerOption;

    private _requestJobPool: string;
    private _scheduleJobPool: string;

    /**
     * Create a dispatch handler instance from options and contributor
     *
     * @param options dispatch handler option
     * @param contributor app framework contributor for registering some external apis
     */
    public constructor(options?: DispatchHandlerOption, contributor?: IContributor<ICSPContributorFactorProtocolMap>) {
        this._options = options;
        this._contributor = contributor;
        this._requestJobPool = "";
        this._scheduleJobPool = "";

        // create endpoints
        this._contributor?.registerEndpoint("dispatch-handler.network-dispatcher");
        this._contributor?.registerEndpoint("dispatch-handler.job-dispatcher");

        // export execution module
        this._contributor?.exportModule(
            "dispatch-handler.network-dispatcher",
            DISPATCH_HANDLER_MODULE_ID,
            this._networkDispatch.bind(this),
        );
        this._contributor?.exportModule(
            "dispatch-handler.job-dispatcher",
            DISPATCH_HANDLER_MODULE_ID,
            this._jobDispatch.bind(this),
        );
    }

    /** To initialize the dispath handler */
    public initialize(): void {
        this._requestJobPool = createJobManager({ limitWorkers: this._options?.limitRequestsWorkers }, this._contributor);
        this._scheduleJobPool = createJobManager({ limitWorkers: this._options?.limitScheduleWorkers }, this._contributor);
    }

    /**
     * to handle a network request
     *
     * @param data request payload data
     * @returns return a network service response
     */
    private async _networkDispatch(data: { rest: PathEntry; payload: RequestPayloadData }): Promise<NetworkServiceResponseData> {
        const dispatcher = this._contributor?.findModule("job-manager.dispatch", this._requestJobPool);
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

        const dir = path.resolve(__dirname, "../script/network-runner");
        const { exitCode, value, error, status } = await dispatcher({
            script: findActualModule(dir) || /* istanbul ignore next */ dir,
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
                binary: value?.binary,
            };
            return result;
        }
    }

    /**
     * to handle a schedule job
     *
     * @param data job payload data
     * @returns return a job execution result
     */
    private async _jobDispatch(payload: JobWorkerPayload): Promise<JobWorkerExecutionResult> {
        const dispatcher = this._contributor?.findModule("job-manager.dispatch", this._scheduleJobPool);
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
        const dir = path.resolve(__dirname, "../script/job-runner");
        const result = await dispatcher({
            payload,
            script: findActualModule(dir) || /* istanbul ignore next */ dir,
        });

        return result;
    }
}
