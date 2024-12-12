/** @format */

import { LogLevel } from "@aitianyu.cn/types";

/** CSP Log API for global */
export interface ILogger {
    /**
     * Write a log with specified log level
     *
     * @param msg the message body
     * @param level the log level, if not be specified, to print as default log
     * @param timer a boolean value indicates whether needs to add a timestamp for the log
     */
    log(msg: string, level?: LogLevel): Promise<void>;
    /**
     * Write a info log
     * @param msg the message body
     * @param timer a boolean value indicates whether needs to add a timestamp for the log
     */
    info(msg: string): Promise<void>;
    /**
     * Write a warning log
     * @param msg the message body
     * @param timer a boolean value indicates whether needs to add a timestamp for the log
     */
    warn(msg: string): Promise<void>;
    /**
     * Write a debug log
     * @param msg the message body
     * @param timer a boolean value indicates whether needs to add a timestamp for the log
     */
    debug(msg: string): Promise<void>;
    /**
     * Write a error message
     * @param msg the message body
     * @param timer a boolean value indicates whether needs to add a timestamp for the log
     */
    error(msg: string): Promise<void>;
    /**
     * Write a fatal message
     * @param msg the message body
     * @param timer a boolean value indicates whether needs to add a timestamp for the log
     */
    fatal(msg: string): Promise<void>;
}
