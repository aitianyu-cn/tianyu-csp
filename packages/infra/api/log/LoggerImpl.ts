/** @format */

import { LogLevel } from "@aitianyu.cn/types";
import { ILogger } from "./ILogger";
import { pushLog } from "./LoggerDBHandler";

export class LoggerImpl implements ILogger {
    log(msg: string, level?: LogLevel, timer?: boolean): void {
        pushLog(msg, level || LogLevel.DEBUG, !!timer);
    }
    info(msg: string, timer?: boolean): void {
        this.log(msg, LogLevel.INFO, timer);
    }
    warn(msg: string, timer?: boolean): void {
        this.log(msg, LogLevel.WARNING, timer);
    }
    debug(msg: string, timer?: boolean): void {
        this.log(msg, LogLevel.DEBUG, timer);
    }
    error(msg: string, timer?: boolean): void {
        this.log(msg, LogLevel.ERROR, timer);
    }
    fatal(msg: string, timer?: boolean): void {
        this.log(msg, LogLevel.FATAL, timer);
    }
}
