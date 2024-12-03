/** @format */

import { LogLevel } from "@aitianyu.cn/types";
import { ILogger } from "../interface/Logger";
import { pushLog } from "../db/LoggerAccessor";

export class LoggerImpl implements ILogger {
    log(sessionId: string, msg: string, level?: LogLevel, timer?: boolean): void {
        pushLog(sessionId, msg, level || LogLevel.DEBUG, !!timer);
    }
    info(sessionId: string, msg: string, timer?: boolean): void {
        this.log(sessionId, msg, LogLevel.INFO, timer);
    }
    warn(sessionId: string, msg: string, timer?: boolean): void {
        this.log(sessionId, msg, LogLevel.WARNING, timer);
    }
    debug(sessionId: string, msg: string, timer?: boolean): void {
        this.log(sessionId, msg, LogLevel.DEBUG, timer);
    }
    error(sessionId: string, msg: string, timer?: boolean): void {
        this.log(sessionId, msg, LogLevel.ERROR, timer);
    }
    fatal(sessionId: string, msg: string, timer?: boolean): void {
        this.log(sessionId, msg, LogLevel.FATAL, timer);
    }
}
