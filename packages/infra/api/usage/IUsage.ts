/** @format */

import { ProjectDefine, UsageAction } from "../Constant";

export interface IUsage {
    record(project: ProjectDefine, moduleName: string, action: UsageAction, msg?: string): void;
}
