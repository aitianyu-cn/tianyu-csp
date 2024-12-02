/** @format */

import { CallbackActionT } from "@aitianyu.cn/types";
import path from "path";

/**
 * Type of CSP default projects
 *
 * core: core functionality of CSP
 * data: database, local storage and runtime cache APIs
 * infra: CSP infra part, no exports API
 * job: schedule job and multi-threads job worker APIs
 * monitor: status monitor of all CSP components
 * network: network related APIs
 */
export type ProjectDefine = "core" | "data" | "infra" | "job" | "monitor" | "network";

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

/** CSP feature config for each one feature */
export interface IFeaturesConfig {
    /** indicates the feature is default enabled if it is true */
    enable: boolean;
    /** description of the feature */
    description: string;
    /** contains the dependent feature names, indicates current feature can be enabled
     *  only when all the dependent features all enabled
     */
    dependency: string[];
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

/** Map of internal directory map*/
export const DirectoryMap = {
    INFRA_RESOURCES: path.resolve(__dirname, "../resources"),
};

export const FATAL_ERROR_EXIT_CODE = -100;

export const NODE_ENV_CONFIG_NAMES = {
    ENVIRONMENT: "environment",
};
