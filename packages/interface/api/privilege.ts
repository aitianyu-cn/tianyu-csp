/** @format */

import { OperationActions } from "../csp-config";

export type TianyuCSPPrivilegeType = "allow" | "aviod" | "non";

/** Map of functionalities privilege */
export type FunctionalityPrivilegeMap = { [action in OperationActions]: TianyuCSPPrivilegeType };
