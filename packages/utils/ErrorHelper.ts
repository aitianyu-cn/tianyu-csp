/** @format */

import { HTTP_STATUS_CODE, JobExecutionStatus, OperationError } from "#interface";

const HTTP_JOB_STATUES_MAP: {
    [job_status in JobExecutionStatus]: number;
} = {
    active: HTTP_STATUS_CODE.NO_CONTENT,
    invalid: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
    running: HTTP_STATUS_CODE.PROCESSING,
    done: HTTP_STATUS_CODE.OK,
    error: HTTP_STATUS_CODE.FORBIDDEN,
    timeout: HTTP_STATUS_CODE.REQUEST_TIMEOUT,
};

/**
 * @public
 *
 * Tianyu CSP Helper of Error
 */
export class ErrorHelper {
    /**
     * To get an operation error define from giving error source.
     *
     * @param code error code
     * @param message simple message to describe the error
     * @param errorDetails detailed message to describe the error
     * @returns return an error package contains error info and trace id
     */
    public static getError(code: string, message: string, errorDetails?: string): OperationError {
        return {
            code,
            message,
            traceId: TIANYU?.trace?.getId() || undefined,
            error: errorDetails,
        };
    }

    /**
     * To get an operation error string from giving error source.
     *
     * @param code error code
     * @param message simple message to describe the error
     * @param errorDetails detailed message to describe the error
     * @returns return a JSON string stringified by operation error define
     */
    public static getErrorString(code: string, message: string, errorDetails?: string): string {
        return JSON.stringify({
            code,
            message,
            traceId: TIANYU?.trace?.getId() || undefined,
            error: errorDetails,
        });
    }

    /**
     * To convert job execution status to be a http status
     *
     * @param status job status
     * @returns return http status
     */
    public static getHttpStatusByJobStatus(status: JobExecutionStatus): number {
        return HTTP_JOB_STATUES_MAP[status] || HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;
    }
}
