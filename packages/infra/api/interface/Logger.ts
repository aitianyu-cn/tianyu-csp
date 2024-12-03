/** @format */

import { LogLevel } from "@aitianyu.cn/types";

export interface ILogger {
    /**
     * Write a log with specified log level
     *
     * @param msg the message body
     * @param level the log level, if not be specified, to print as default log
     * @param timer a boolean value indicates whether needs to add a timestamp for the log
     */
    log(sessionId: string, msg: string, level?: LogLevel, timer?: boolean): void;
    /**
     * Write a info log
     * @param msg the message body
     * @param timer a boolean value indicates whether needs to add a timestamp for the log
     */
    info(sessionId: string, msg: string, timer?: boolean): void;
    /**
     * Write a warning log
     * @param msg the message body
     * @param timer a boolean value indicates whether needs to add a timestamp for the log
     */
    warn(sessionId: string, msg: string, timer?: boolean): void;
    /**
     * Write a debug log
     * @param msg the message body
     * @param timer a boolean value indicates whether needs to add a timestamp for the log
     */
    debug(sessionId: string, msg: string, timer?: boolean): void;
    /**
     * Write a error message
     * @param msg the message body
     * @param timer a boolean value indicates whether needs to add a timestamp for the log
     */
    error(sessionId: string, msg: string, timer?: boolean): void;
    /**
     * Write a fatal message
     * @param msg the message body
     * @param timer a boolean value indicates whether needs to add a timestamp for the log
     */
    fatal(sessionId: string, msg: string, timer?: boolean): void;
}
