/** @format */

import { LogLevel } from "@aitianyu.cn/types";
import { TRACE } from "../trace/Trace";
import { LogHelper } from "../utils/LogHelper";
import { DatabaseDefaultTableMap, DefaultTableId, IDatabaseAPIBase, IDatabaseManager, SupportedDatabaseType } from "./interface";
import { TraceHelper } from "../utils/TraceHelper";
import { InvalidDBMgr } from "./InvalidDBMgr";
import { FATAL_ERROR_EXIT_CODE } from "../Constant";

const _dbCache: {
    mgr: IDatabaseManager;
    inited: boolean;
} = {
    mgr: new InvalidDBMgr(),
    inited: false,
};

export class InfraDB {
    public static registerDB(dbMgr: IDatabaseManager): void {
        if (_dbCache.inited) {
            TRACE.logAndTrace(LogHelper.generateMsg("infra", "database", "Duplicated initialized database"), LogLevel.ERROR, {
                id: TraceHelper.generateTraceId("infra", "database"),
                error: "Duplicated initialized database",
                area: "core",
            });
            return;
        }

        _dbCache.mgr = dbMgr;
        _dbCache.inited = true;
    }

    public static unregisterDB(): void {
        _dbCache.mgr = new InvalidDBMgr();
        _dbCache.inited = false;
    }

    public static getConnection(databaseName: string): IDatabaseAPIBase {
        if (!_dbCache.inited) {
            process.exit(FATAL_ERROR_EXIT_CODE);
        }

        return _dbCache.mgr.connect(databaseName);
    }

    public static translateTable(tableId: DefaultTableId): DatabaseDefaultTableMap & { tableMapping: string } {
        if (!_dbCache.inited) {
            process.exit(FATAL_ERROR_EXIT_CODE);
        }

        return _dbCache.mgr.mappingTable(tableId);
    }

    public static databaseType(databaseName: string): SupportedDatabaseType {
        return _dbCache.mgr.databaseType(databaseName);
    }
}
