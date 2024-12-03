/** @format */

import { LogLevel, MapOfType } from "@aitianyu.cn/types";
import { LogHelper } from "./LogHelper";
import { BACKEND_SESSION_USER, EXIT_CODES } from "../Constant";
import { InvalidSessionMgr } from "../impl/InvalidSessionMgr";
import { OperationActions } from "../interface/Declars";
import { ISessionManagerBase, ISessionInfo, ISessionPrivilege } from "../interface/Session";
import { TraceHelper } from "./TraceHelper";
import { pushTrace } from "../db/TraceAccessor";

const _sessionCache: {
    mgr: ISessionManagerBase;
    inited: boolean;
} = {
    mgr: new InvalidSessionMgr(),
    inited: false,
};

export function registerSession(sessionMgr: ISessionManagerBase): void {
    if (_sessionCache.inited) {
        pushTrace(
            BACKEND_SESSION_USER,
            LogHelper.generateMsg("infra", "session", "Duplicated initialized session manager"),
            LogLevel.ERROR,
            {
                id: TraceHelper.generateTraceId("infra", "session"),
                error: "Duplicated initialized session manager",
                area: "core",
            },
        );
        return;
    }

    _sessionCache.mgr = sessionMgr;
    _sessionCache.inited = true;
}

export function unregisterSession(): void {
    _sessionCache.mgr = new InvalidSessionMgr();
    _sessionCache.inited = false;
}

export class InfraSession {
    public static getSessionInfo(id: string): ISessionInfo {
        if (!_sessionCache.inited) {
            process.exit(EXIT_CODES.FATAL_ERROR);
        }

        return _sessionCache.mgr.getInfo(id);
    }

    public static getPrivilege(userId: string): MapOfType<ISessionPrivilege> {
        if (!_sessionCache.inited) {
            return {};
        }

        return _sessionCache.mgr.getPrivilege(userId);
    }

    public static checkPrivilege(userId: string, functionality: string, action: OperationActions): boolean {
        if (!_sessionCache.inited) {
            return false;
        }

        return _sessionCache.mgr.checkPrivilege(userId, functionality, action);
    }
}
