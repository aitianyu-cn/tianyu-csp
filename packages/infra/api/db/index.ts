/** @format */

import { InfraDB } from "./Configuration";
import { IDatabaseManager } from "./interface";

export * from "./interface";

export function registerDB(dbMgr: IDatabaseManager): void {
    InfraDB.registerDB(dbMgr);
}

export function unregisterDB(): void {
    InfraDB.unregisterDB();
}
