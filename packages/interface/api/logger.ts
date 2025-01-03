/** @format */

import { LogLevel } from "@aitianyu.cn/types";

/** Log level to string map */
export const LogLevelMap: { [key in LogLevel]: string } = {
    [LogLevel.DEBUG]: "DEBUG",
    [LogLevel.ERROR]: "ERROR",
    [LogLevel.FATAL]: "FATAL",
    [LogLevel.INFO]: "INFO",
    [LogLevel.LOG]: "LOG",
    [LogLevel.WARNING]: "WARNING",
};

/** CSP Log API for global */
export interface ILogger {
    /**
     * Write a log with specified log level
     *
     * @param msg the message body
     * @param level the log level, if not be specified, to print as default log
     */
    log(msg: string, level?: LogLevel): Promise<void>;
    /**
     * Write a info log
     * @param msg the message body
     */
    info(msg: string): Promise<void>;
    /**
     * Write a warning log
     * @param msg the message body
     */
    warn(msg: string): Promise<void>;
    /**
     * Write a debug log
     * @param msg the message body
     */
    debug(msg: string): Promise<void>;
    /**
     * Write a error message
     * @param msg the message body
     */
    error(msg: string): Promise<void>;
    /**
     * Write a fatal message
     * @param msg the message body
     */
    fatal(msg: string): Promise<void>;
}
