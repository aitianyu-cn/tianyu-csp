/** @format */

import { LogLevel } from "@aitianyu.cn/types";
import { ITrace, ITraceConfig } from "./ITrace";
import { LOGGER } from "../log/Logger";
import { Operations } from "../ops";
import { RuntimeHelper } from "../utils/RuntimeHelper";
import { pushTrace } from "./TraceDBHandler";
import { TraceHelper } from "../utils/TraceHelper";

export class TraceImpl implements ITrace {
    log(message: string, level: LogLevel): void {
        if (Operations.FeatureManager.isActive("TRACE_CONSOLE_LOG_ENABLEMENT") && RuntimeHelper.isProduction) {
            LOGGER.debug(message, true);
        }
    }
    logAndTrace(message: string, level: LogLevel, config?: ITraceConfig): void {
        this.log(message, level);

        pushTrace(
            message,
            level,
            config ?? {
                id: TraceHelper.generateTraceId("infra", "Trace"),
            },
        );
    }
}
