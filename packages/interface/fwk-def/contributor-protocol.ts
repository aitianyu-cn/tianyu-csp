/** @format */

import { ContributorProtocolWithReturn } from "./contributor/basic";
import { DispatcherTriggerType } from "./contributor/dispatcher";
import { JobWorkerExecutionResult, JobWorkerOptions } from "./contributor/job";
import {
    DefaultRequestItemsMap,
    DefaultRequestItemTargetType,
    RequestPayloadData,
    ResponsePayloadData,
} from "./contributor/requests";
import { NetworkServiceResponseData } from "./contributor/service";

/** Extendable by user. */
export interface IContributorFactorProtocolMap {
    // =======================================================================
    // This is default definitions for core using
    // =======================================================================

    /** To get a request item processor for request service */
    "request-handler.items-getter": ContributorProtocolWithReturn<
        { name: keyof DefaultRequestItemsMap; type: DefaultRequestItemTargetType },
        string
    >;
    /** To get a request dispatcher for request service */
    "request-handler.dispatcher": ContributorProtocolWithReturn<RequestPayloadData, Promise<NetworkServiceResponseData>>;

    /** To get a request dispatcher for request service */
    "dispatch-handler.dispatcher": ContributorProtocolWithReturn<
        RequestPayloadData & { trigger: DispatcherTriggerType },
        Promise<NetworkServiceResponseData>
    >;

    "job-manager.dispatch": ContributorProtocolWithReturn<
        { script: string; options: JobWorkerOptions },
        Promise<JobWorkerExecutionResult>
    >;
}
