/** @format */

import { OperationActions } from "../csp-config";

/**
 * CSP privilege operation status type
 *
 * @example
 * allow    // the operation is allowed
 * avoid    // the operation is avoid
 * non      // the operation is not required
 */
export type TianyuCSPPrivilegeType = "allow" | "avoid" | "non";

/** Map of functionalities privilege */
export type FunctionalityPrivilegeMap = { [action in OperationActions]: TianyuCSPPrivilegeType };
