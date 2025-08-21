/** @format */

import { ILogger, LogLevelMap } from "#interface";
import { LogLevel } from "@aitianyu.cn/types";
import { PROJECT_ENVIRONMENT_MODE } from "../../Common";
import { TraceHelper } from "#utils";
import { doXcall } from "./code/GenericXcall";
import { MessageBundle } from "#base/res/InternalMessageBundle";

/** CSP Log Manager for global definition */
export class LoggerManager implements ILogger {
    public async log(msg: string, level: LogLevel = LogLevel.DEBUG): Promise<void> {
        await doXcall(
            {
                user: TIANYU.session.user.userId,
                level: LogLevelMap[level],
                time: TraceHelper.generateTime(),
                message: msg,
            },
            "logger",
            "log",
            MessageBundle.text(
                "ERROR_CORE_INFRA_LOG_MGR_FAILED",
                LogLevelMap[level],
                msg.substring(0, msg.length > 20 ? 20 : msg.length),
            ),
            true,
        );
    }
    public async info(msg: string): Promise<void> {
        return this.log(msg, LogLevel.INFO);
    }
    public async warn(msg: string): Promise<void> {
        return this.log(msg, LogLevel.WARNING);
    }
    public async debug(msg: string): Promise<void> {
        return PROJECT_ENVIRONMENT_MODE === "development"
            ? this.log(msg, LogLevel.DEBUG)
            : /* istanbul ignore next */ Promise.resolve();
    }
    public async error(msg: string): Promise<void> {
        return this.log(msg, LogLevel.ERROR);
    }
    public async fatal(msg: string): Promise<void> {
        return this.log(msg, LogLevel.FATAL);
    }
}
