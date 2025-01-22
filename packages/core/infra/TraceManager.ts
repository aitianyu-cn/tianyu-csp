/** @format */

import { ITrace, TraceArea } from "#interface";
import { TraceHelper } from "#utils";
import { doXcall } from "./code/GenericXcall";

/** CSP Trace Manager for global definition */
export class TraceManager implements ITrace {
    private _traceId: string;

    public constructor() {
        this._traceId = "";
    }

    public getId(): string {
        return this._traceId;
    }
    public setId(id: string): void {
        this._traceId = id;
    }
    public async trace(message: string, errorDetails?: string, area?: TraceArea): Promise<void> {
        await doXcall(
            {
                user: TIANYU.session.user.userId,
                traceId: this._traceId,
                time: TraceHelper.generateTime(),
                message: message,
                details: errorDetails || "",
                area: area || "edge",
            },
            "trace",
            "trace",
            `Could not to record the trace for '${message.substring(0, message.length > 20 ? 20 : message.length)}'.`,
        );
    }
}
