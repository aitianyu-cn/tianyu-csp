/** @format */

import { LogLevel } from "@aitianyu.cn/types";

export type TraceArea = "core" | "edge";

export interface ITraceConfig {
    id: string;
    error?: string;
    area?: TraceArea;
}

export interface ITrace {
    log(message: string, level: LogLevel): Promise<void>;
    logAndTrace(message: string, level: LogLevel, config?: ITraceConfig): Promise<void>;
}

export interface ITraceDBRecord {
    user: string;
    id: string;
    level: LogLevel;
    time: string;
    msg: string;
    error: string;
    area: TraceArea;
}
