/** @format */

/**
 * Type of supported opertion actions
 *
 * read: access a resource
 * write: open a resource and to do a data write operation
 * delete: remove a resource
 * change: to update a resource
 * execute: to start a job
 */
export type OperationActions = "read" | "write" | "delete" | "change" | "execute";

/** Map of functionalities privilege */
export type FunctionalityPrivilegeMap = { [action in OperationActions]: boolean };
