/** @format */

import { OperationActions } from "./privilege";

/** CSP usage record API for global */
export interface IUsage {
    /**
     * To record a new usage data
     *
     * @param project project name
     * @param moduleName module or function name of project
     * @param action which operation action type is the user using
     * @param msg additional message of the usage
     */
    record(project: string, moduleOrFunctionName: string, action: OperationActions, msg?: string): Promise<void>;
}
