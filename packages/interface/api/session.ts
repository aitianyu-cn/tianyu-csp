/** @format */

import { AreaCode } from "@aitianyu.cn/types";
import { OperationActions } from "./privilege";

/** CSP session user info */
export interface ISessionUser {
    /** Unified User Id */
    userId: string;
    /** User Display Name */
    displayName: string;
}

/** CSP session and user API for global */
export interface ISession {
    /** Current Session Id */
    sessionId: string;
    /** Admin permission of Session User */
    adminMode: boolean;

    /** Language of current session */
    language: AreaCode;
    /** Language of current application default setting */
    defaultLanguage: AreaCode;

    /** Session based user info */
    user: ISessionUser;

    /**
     * get an action of a functionality whether is permitted for current user
     *
     * @param functionality functionality name
     * @param action operation action
     *
     * @returns return true if the user has privilege of action, otherwise false
     */
    checkPrivilege(functionality: string, action: OperationActions): boolean;
}
