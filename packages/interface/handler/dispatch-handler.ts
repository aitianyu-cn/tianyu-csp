/** @format */

export interface DispatchHandlerOption {
    /** the maximum workers count */
    limitRequestsWorkers?: number;
    limitScheduleWorkers?: number;
}

export const DISPATCH_HANDLER_MODULE_ID = "dispatch-handler-default-module";
