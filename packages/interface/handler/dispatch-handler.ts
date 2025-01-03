/** @format */

export interface DispatchHandlerOption {
    /** the maximum workers count for request handling */
    limitRequestsWorkers?: number;
    /** the maximum workers count for schedule jobs */
    limitScheduleWorkers?: number;
}

/** Dispatch handler module id for contributor */
export const DISPATCH_HANDLER_MODULE_ID = "dispatch-handler-default-module";
