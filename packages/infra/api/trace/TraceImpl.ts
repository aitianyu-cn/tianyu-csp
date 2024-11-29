/** @format */

import { LogLevel } from "@aitianyu.cn/types";
import { ITrace, ITraceConfig } from "./ITrace";

export class TraceImpl implements ITrace {
    log(message: string, level: LogLevel): void {
        throw new Error("Method not implemented.");
    }
    logAndTrace(message: string, level: LogLevel, config?: ITraceConfig): void {
        throw new Error("Method not implemented.");
    }
}
