/** @format */

import { guid } from "@aitianyu.cn/types";
import { ProjectDefine } from "../Constant";

export class TraceHelper {
    public static generateTraceId(project: ProjectDefine, moduleName: string): string {
        return guid();
    }
}
