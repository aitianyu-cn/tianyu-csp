/** @format */

import { OperationActions } from "./Declars";

export interface IUsage {
    record(project: string, moduleName: string, action: OperationActions, msg?: string): Promise<void>;
}

export interface IUsageDBRecord {
    user: string;
    project: string;
    module: string;
    action: OperationActions;
    time: string;
    msg: string;
}
