/** @format */

/**
 * @public
 *
 * Operation Failed Structure
 */
export interface OperationError {
    /** Error code */
    code: string;
    /** Error message */
    message: string;
    /** Technical error message */
    error?: string;
    /** id for trace recording */
    traceId?: string;
}
