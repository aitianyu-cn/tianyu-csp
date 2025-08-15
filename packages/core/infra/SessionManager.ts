/** @format */

import {
    FunctionalityPrivilegeMap,
    IServerRequest,
    ISession,
    ISessionUser,
    OperationActions,
    ScheduleJobPayload,
    TianyuCSPPrivilegeType,
} from "#interface";
import { AreaCode, MapOfType } from "@aitianyu.cn/types";
import { PROJECT_DEFAULT_LANGUAGE } from "../../Common";
import { handleSession, handleSessionIsAdminMode, handleSessionPrivileges, handleSessionUser } from "./code/SessionCodes";

/**
 * CSP Generic Session Manager for global definition
 *
 * This is only used in job worker thread
 */
export class SessionManager implements ISession {
    private _sessionId: string;
    private _adminMode: boolean;
    private _language: AreaCode;
    private _userId: string;
    private _userDpname: string;

    private _privileges: MapOfType<FunctionalityPrivilegeMap>;

    public constructor(requests: IServerRequest | ScheduleJobPayload) {
        this._sessionId = (requests as any).session || "";

        this._adminMode = false;
        this._language = requests.language;
        this._userId = (requests as any).userId || "";
        this._userDpname = "";
        this._privileges = {};
    }

    /** To load data from database */
    public async loadData(): Promise<void> {
        const userId = this._userId || (await handleSession(this.sessionId));
        const { name, license } = await handleSessionUser(userId);
        const { admin } = await handleSessionIsAdminMode(license);
        const privileges = await handleSessionPrivileges(license);

        this._adminMode = admin;

        this._userId = userId;
        this._userDpname = name;

        this._privileges = privileges;
    }

    public get sessionId(): string {
        return this._sessionId;
    }
    public get adminMode(): boolean {
        return this._adminMode;
    }
    public get language(): AreaCode {
        return this._language;
    }
    public get defaultLanguage(): AreaCode {
        return PROJECT_DEFAULT_LANGUAGE;
    }
    public get user(): ISessionUser {
        return {
            userId: this._userId,
            displayName: this._userDpname,
        };
    }
    public checkPrivilege(functionality: string, action: OperationActions): TianyuCSPPrivilegeType {
        return this._privileges[functionality]?.[action] || "non";
    }
}

export const BACKEND_SESSION_USER = "00000000-0000-0000-0000-000000000000";

/**
 * CSP System Session Manager for global definition
 *
 * This is only used in main thread, and job worker will not use this manager
 */
export class GlobalSessionManager implements ISession {
    public get sessionId(): string {
        return "";
    }
    public get adminMode(): boolean {
        return true;
    }
    public get language(): AreaCode {
        return PROJECT_DEFAULT_LANGUAGE;
    }
    public get defaultLanguage(): AreaCode {
        return PROJECT_DEFAULT_LANGUAGE;
    }
    public get user(): ISessionUser {
        return {
            userId: BACKEND_SESSION_USER,
            displayName: "BACKEND",
        };
    }
    public checkPrivilege(_functionality: string, _action: OperationActions): TianyuCSPPrivilegeType {
        return "allow";
    }
}
