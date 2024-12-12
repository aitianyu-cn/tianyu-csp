/** @format */

/**
 * Error Trace Area type
 *
 * core: indicates the error is in core part which will cause application fatal issue
 * edge: indicates the error is in edge part which can be resume automatically
 */
export type TraceArea = "core" | "edge";

/** CSP error trace record API for global */
export interface ITrace {
    /**
     * Get current trace id
     *
     * @returns return a trace id if exist, return empty string if trace id does not exist
     */
    getId(): string;
    /**
     * Set a new trace id
     *
     * @param id new trace id
     */
    setId(id: string): void;

    /**
     * To record a new trace data
     *
     * @param message trace error message
     * @param errorDetails detailed error message
     * @param area error impaction area
     */
    trace(message: string, errorDetails?: string, area?: TraceArea): Promise<void>;
}
