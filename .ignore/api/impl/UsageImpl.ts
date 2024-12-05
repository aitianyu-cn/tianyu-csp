/** @format */

import { OperationActions } from "../interface/Declars";
import { IUsage } from "../interface/Usage";

export class UsageImpl implements IUsage {
    record(project: string, moduleName: string, action: OperationActions, msg?: string): void {
        throw new Error("Method not implemented.");
    }
}
