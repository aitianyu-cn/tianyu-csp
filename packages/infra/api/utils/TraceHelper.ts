/** @format */

import { guid } from "@aitianyu.cn/types";
import { ProjectDefine } from "../Constant";

/** Trace Helpers */
export class TraceHelper {
    /**
     * Generate a trace id from project and module name.
     *
     * @param project project name
     * @param moduleName module name
     * @returns return a guid which generated from given project and module
     */
    public static generateTraceId(project: ProjectDefine, moduleName: string): string {
        return guid();
    }
}
