/** @format */

import { LogLevel } from "@aitianyu.cn/types";

export type TraceArea = "core" | "edge";

export interface ITraceConfig {
    id: string;
    error?: string;
    area?: TraceArea;
}

export interface ITrace {
    log(message: string, level: LogLevel): void;
    logAndTrace(message: string, level: LogLevel, config?: ITraceConfig): void;
}
