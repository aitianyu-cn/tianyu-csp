/** @format */

import { LogLevel } from "@aitianyu.cn/types";
import { LogHelper } from "./LogHelper";
import { TraceHelper } from "./TraceHelper";
import { InvalidDBMgr } from "../impl/InvalidDBMgr";
import { BACKEND_SESSION_USER, EXIT_CODES } from "../Constant";
import {
    IDatabaseManager,
    IDatabaseAPIBase,
    DefaultTableId,
    DatabaseDefaultTableMap,
    SupportedDatabaseType,
} from "../interface/Database";
import { pushTrace } from "../db/TraceAccessor";

const _dbCache: {
    mgr: IDatabaseManager;
    inited: boolean;
} = {
    mgr: new InvalidDBMgr(),
    inited: false,
};

export function registerDB(dbMgr: IDatabaseManager): void {
    if (_dbCache.inited) {
        pushTrace(
            BACKEND_SESSION_USER,
            LogHelper.generateMsg("infra", "database", "Duplicated initialized database"),
            LogLevel.ERROR,
            {
                id: TraceHelper.generateTraceId("infra", "database"),
                error: "Duplicated initialized database",
                area: "core",
            },
        );
        return;
    }

    _dbCache.mgr = dbMgr;
    _dbCache.inited = true;
}

export function unregisterDB(): void {
    _dbCache.mgr = new InvalidDBMgr();
    _dbCache.inited = false;
}

export class InfraDB {
    public static getConnection(databaseName: string): IDatabaseAPIBase {
        if (!_dbCache.inited) {
            process.exit(EXIT_CODES.FATAL_ERROR);
        }

        return _dbCache.mgr.connect(databaseName);
    }

    public static translateTable(tableId: DefaultTableId): DatabaseDefaultTableMap & { tableMapping: string } {
        if (!_dbCache.inited) {
            process.exit(EXIT_CODES.FATAL_ERROR);
        }

        return _dbCache.mgr.mappingTable(tableId);
    }

    public static databaseType(databaseName: string): SupportedDatabaseType {
        return _dbCache.mgr.databaseType(databaseName);
    }
}
