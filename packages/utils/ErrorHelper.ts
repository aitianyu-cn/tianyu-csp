/** @format */

import { OperationError } from "#interface";

export class ErrorHelper {
    public static getError(code: string, message: string, errorDetails?: string): OperationError {
        return {
            code,
            message,
            traceId: tianyu.trace.getId() || undefined,
            error: errorDetails,
        };
    }
}
