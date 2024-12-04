/** @format */

import { LogLevel } from "@aitianyu.cn/types";
import { RuntimeHelper } from "../utils/RuntimeHelper";
import { TraceHelper } from "../utils/TraceHelper";
import { pushTrace } from "../db/TraceAccessor";
import { ITrace, ITraceConfig } from "../interface/Trace";
import { pushLog } from "../db/LoggerAccessor";
import { selectFeatureIsActive } from "../db/FeatureAccessor";

export class TraceImpl implements ITrace {
    log(message: string, level: LogLevel): void {
        if (RuntimeHelper.isProduction) {
            selectFeatureIsActive(sessionId, "TRACE_CONSOLE_LOG_ENABLEMENT").then(
                (isActive) => {
                    if (isActive) {
                        pushLog(sessionId, message, level, true);
                    }
                },
                () => {
                    // for error case, nothing to do.
                },
            );
        }
    }
    logAndTrace(message: string, level: LogLevel, config?: ITraceConfig): void {
        this.log(sessionId, message, level);

        pushTrace(
            sessionId,
            message,
            level,
            config ?? {
                id: TraceHelper.generateTraceId("infra", "Trace"),
            },
        );
    }
}
