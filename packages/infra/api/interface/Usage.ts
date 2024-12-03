/** @format */

import { OperationActions } from "./Declars";

export interface IUsage {
    record(sessionId: string, project: string, moduleName: string, action: OperationActions, msg?: string): void;
}
