/** @format */

import { OperationError } from "#interface";

export class ErrorHelper {
    public static getError(code: string, message: string, errorDetails?: string): OperationError {
        return {
            code,
            message,
            traceId: TIANYU.trace.getId() || undefined,
            error: errorDetails,
        };
    }
}
