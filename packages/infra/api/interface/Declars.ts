/** @format */

import { CallbackActionT } from "@aitianyu.cn/types";

/**
 * Type of supported opertion actions
 *
 * Read: access a resource
 * Write: open a resource and to do a data write operation
 * Delete: remove a resource
 * Change: to update a resource
 * Execute: to start a job
 */
export type OperationActions = "Read" | "Write" | "Delete" | "Change" | "Execute";

export enum RolePrivilegeType {
    ALLOW = 1,
    NOT = 0,
}

/** Operation Failed Structure */
export interface OperationFailed {
    /** Error code */
    code: string;
    /** Error message */
    message: string;
    /** Technical error message */
    error?: string;
    /** id for trace recording */
    traceId?: string;
}

/**
 * Callback function for sync operation
 *
 * @template TS type of success operating result
 * @template TF type of failed operating result
 */
export interface SyncOperationCallback<TS = any, TF = {}> {
    /** operation success callback function */
    success: CallbackActionT<TS>;
    /** operation failed callback function */
    failed?: CallbackActionT<TF & OperationFailed>;
}

export interface IGlobalEnvironmentConfig {
    baseUrl: string;
}
