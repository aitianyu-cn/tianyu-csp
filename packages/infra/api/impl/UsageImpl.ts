/** @format */

import { OperationActions } from "../interface/Declars";
import { IUsage } from "../interface/Usage";

export class UsageImpl implements IUsage {
    record(sessionId: string, project: string, moduleName: string, action: OperationActions, msg?: string): void {
        throw new Error("Method not implemented.");
    }
}
