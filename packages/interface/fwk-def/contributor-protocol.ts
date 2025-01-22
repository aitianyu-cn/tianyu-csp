/** @format */

import { ContributorProtocolWithReturn } from "@aitianyu.cn/tianyu-app-fwk";
import { JobWorkerExecutionResult, JobWorkerPayload } from "./contributor/job";
import { DefaultRequestItemsMap, DefaultRequestItemTargetType, RequestPayloadData } from "./contributor/requests";
import { NetworkServiceResponseData } from "./contributor/service";
import { PathEntry } from "../handler/rest-handler";

/** Extendable by user. */
export interface ICSPContributorFactorProtocolMap {
    // =======================================================================
    // This is default definitions for core using
    // =======================================================================

    /** To get a request item processor for request service */
    "request-handler.items-getter": ContributorProtocolWithReturn<
        { name: keyof DefaultRequestItemsMap; type: DefaultRequestItemTargetType },
        string
    >;
    /** To get a request dispatcher for request service */
    "request-handler.dispatcher": ContributorProtocolWithReturn<
        { rest: PathEntry; payload: RequestPayloadData },
        Promise<NetworkServiceResponseData>
    >;

    /** To get a request dispatcher for request service */
    "dispatch-handler.network-dispatcher": ContributorProtocolWithReturn<
        { rest: PathEntry; payload: RequestPayloadData },
        Promise<NetworkServiceResponseData>
    >;
    /** To get a request dispatcher for request service */
    "dispatch-handler.job-dispatcher": ContributorProtocolWithReturn<JobWorkerPayload, Promise<JobWorkerExecutionResult>>;

    "job-manager.dispatch": ContributorProtocolWithReturn<
        { script: string; payload: JobWorkerPayload },
        Promise<JobWorkerExecutionResult>
    >;
}
