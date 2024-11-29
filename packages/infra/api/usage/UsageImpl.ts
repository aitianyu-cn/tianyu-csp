/** @format */

import { ProjectDefine, UsageAction } from "../Constant";
import { IUsage } from "./IUsage";

export class UsageImpl implements IUsage {
    record(project: ProjectDefine, moduleName: string, action: UsageAction, msg?: string): void {
        throw new Error("Method not implemented.");
    }
}
