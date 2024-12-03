/** @format */

import { LogLevel } from "@aitianyu.cn/types";

export type TraceArea = "core" | "edge";

export interface ITraceConfig {
    id: string;
    error?: string;
    area?: TraceArea;
}

export interface ITrace {
    log(sessionId: string, message: string, level: LogLevel): void;
    logAndTrace(sessionId: string, message: string, level: LogLevel, config?: ITraceConfig): void;
}

export interface ITraceDBRecord {
    id: string;
    level: LogLevel;
    time: string;
    msg: string;
    error: string;
    area: TraceArea;
}
