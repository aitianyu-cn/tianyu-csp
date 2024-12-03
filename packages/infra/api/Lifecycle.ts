/** @format */

import { IDatabaseManager } from "./interface/Database";
import { ISessionManagerBase } from "./interface/Session";
import { registerDB, unregisterDB } from "./utils/InfraDB";
import { registerSession, unregisterSession } from "./utils/InfraSession";

export function register(dbMgr: IDatabaseManager, sessionMgr: ISessionManagerBase): void {
    registerDB(dbMgr);
    registerSession(sessionMgr);
}

export function unregister(): void {
    unregisterDB();
    unregisterSession();
}
