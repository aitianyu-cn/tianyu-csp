/** @format */

import { HTTP_STATUS_CODE, JobExecutionStatus, OperationError } from "#interface";

export class ErrorHelper {
    public static getError(code: string, message: string, errorDetails?: string): OperationError {
        return {
            code,
            message,
            traceId: TIANYU.trace.getId() || undefined,
            error: errorDetails,
        };
    }

    public static getHttpStatusByJobStatus(status: JobExecutionStatus): number {
        switch (status) {
            case "active":
                return HTTP_STATUS_CODE.NO_CONTENT;
            case "invalid":
                return HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;
            case "running":
                return HTTP_STATUS_CODE.PROCESSING;
            case "done":
                return HTTP_STATUS_CODE.OK;
            case "error":
                return HTTP_STATUS_CODE.FORBIDDEN;
            case "timeout":
                return HTTP_STATUS_CODE.REQUEST_TIMEOUT;
            default:
                return HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;
        }
    }
}
