/** @format */

import {
    FunctionalityPrivilegeMap,
    IServerRequest,
    ISession,
    ISessionUser,
    OperationActions,
    REQUEST_HANDLER_MODULE_ID,
} from "#interface";
import { AreaCode, getBoolean, MapOfType } from "@aitianyu.cn/types";
import { PROJECT_DEFAULT_LANGUAGE } from "packages/Common";
import { DEFAULT_REST_REQUEST_ITEM_MAP } from "./Constant";
import { handleSession, handleSessionIsAdminMode, handleSessionPrivileges, handleSessionUser } from "./code/SessionCodes";

export class SessionManager implements ISession {
    private _sessionId: string;
    private _adminMode: boolean;
    private _language: AreaCode;
    private _userId: string;
    private _userDpname: string;

    private _privileges: MapOfType<FunctionalityPrivilegeMap>;

    public constructor(requests: IServerRequest) {
        const sessionIdKey =
            TIANYU.fwk.contributor.findModule(
                "request-handler.items-getter",
                REQUEST_HANDLER_MODULE_ID,
            )?.({ name: "session", type: "cookie" }) || DEFAULT_REST_REQUEST_ITEM_MAP.session;
        this._sessionId = requests.cookie(sessionIdKey);

        this._adminMode = false;
        this._language = requests.language;
        this._userId = "";
        this._userDpname = "";
        this._privileges = {};
    }

    public async loadData(): Promise<void> {
        const userId = await handleSession(this.sessionId);
        const { name, license } = await handleSessionUser(userId);
        const adminMode = await handleSessionIsAdminMode(license);
        const privileges = await handleSessionPrivileges(license);

        this._adminMode = adminMode;

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
    public checkPrivilege(functionality: string, action: OperationActions): boolean {
        return getBoolean(this._privileges[functionality]?.[action]);
    }
}

export const BACKEND_SESSION_USER = "00000000-0000-0000-0000-000000000000";

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
    public checkPrivilege(_functionality: string, _action: OperationActions): boolean {
        return true;
    }
}
