/** @format */

import { IAudit, LogLevelMap } from "#interface";
import { LogLevel } from "@aitianyu.cn/types";
import { handleAuditRecord, IAuditRecordBuffer } from "./code/AuditCode";
import { AUDIT_CONFIGURATION } from "packages/Common";
import { TraceHelper } from "#utils";

export class AuditManager implements IAudit {
    private _buffer: IAuditRecordBuffer[];

    public constructor() {
        this._buffer = [];
    }

    public flush(): void {
        if (this._buffer.length > 0) {
            const transfer = this._buffer;
            this._buffer = [];
            setTimeout(() => {
                handleAuditRecord(transfer);
            }, 0);
        }
    }
    public async record(app: string, message: string, level?: LogLevel, additionalData?: any): Promise<void> {
        if (AUDIT_CONFIGURATION.log) {
            const logMsg = `[${app}] --- ${message}`;
            void TIANYU.logger.log(logMsg, level || LogLevel.LOG);
        }

        this._record(app, message, level || LogLevel.LOG, additionalData);
    }

    public async error(app: string, message: string, additionalData?: any): Promise<void> {
        if (AUDIT_CONFIGURATION.log) {
            const logMsg = `[${app}] --- ${message}`;
            void TIANYU.logger.error(logMsg);
        }

        this._record(app, message, LogLevel.ERROR, additionalData);
    }

    public async debug(app: string, message: string, additionalData?: any): Promise<void> {
        if (AUDIT_CONFIGURATION.log) {
            const logMsg = `[${app}] --- ${message}`;
            void TIANYU.logger.debug(logMsg);
        }

        this._record(app, message, LogLevel.DEBUG, additionalData);
    }

    public async warn(app: string, message: string, additionalData?: any): Promise<void> {
        if (AUDIT_CONFIGURATION.log) {
            const logMsg = `[${app}] --- ${message}`;
            void TIANYU.logger.warn(logMsg);
        }

        this._record(app, message, LogLevel.WARNING, additionalData);
    }

    private async _record(app: string, message: string, level?: LogLevel, additionalData?: any): Promise<void> {
        this._buffer.push({
            app,
            message,
            additionalData,
            level: LogLevelMap[level || LogLevel.INFO],
            timestamp: TraceHelper.generateTime(),
        });

        if (this._buffer.length >= AUDIT_CONFIGURATION.buffer) {
            this.flush();
        }
    }
}
