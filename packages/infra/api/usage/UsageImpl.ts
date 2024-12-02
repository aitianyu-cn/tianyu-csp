/** @format */

import { ProjectDefine, OperationActions } from "../Constant";
import { IUsage } from "./IUsage";

export class UsageImpl implements IUsage {
    record(project: ProjectDefine, moduleName: string, action: OperationActions, msg?: string): void {
        throw new Error("Method not implemented.");
    }
}
