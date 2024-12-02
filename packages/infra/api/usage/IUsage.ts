/** @format */

import { ProjectDefine, OperationActions } from "../Constant";

export interface IUsage {
    record(project: ProjectDefine, moduleName: string, action: OperationActions, msg?: string): void;
}
