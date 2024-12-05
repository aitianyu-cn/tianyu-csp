/** @format */

import { LogLevel } from "@aitianyu.cn/types";
import { ILogger } from "../interface/Logger";
import { pushLog } from "../db/LoggerAccessor";

export class LoggerImpl implements ILogger {
    log(msg: string, level?: LogLevel, timer?: boolean): void {
        pushLog(sessionId, msg, level || LogLevel.DEBUG, !!timer);
    }
    info(msg: string, timer?: boolean): void {
        this.log(sessionId, msg, LogLevel.INFO, timer);
    }
    warn(msg: string, timer?: boolean): void {
        this.log(sessionId, msg, LogLevel.WARNING, timer);
    }
    debug(msg: string, timer?: boolean): void {
        this.log(sessionId, msg, LogLevel.DEBUG, timer);
    }
    error(msg: string, timer?: boolean): void {
        this.log(sessionId, msg, LogLevel.ERROR, timer);
    }
    fatal(msg: string, timer?: boolean): void {
        this.log(sessionId, msg, LogLevel.FATAL, timer);
    }
}
