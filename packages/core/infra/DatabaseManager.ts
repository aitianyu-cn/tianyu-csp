/** @format */

import {
    IDatabaseConnectionConfig,
    IDatabaseManager,
    IDBConnection,
    INosqlDBManager,
    SupportedDatabaseType,
    SupportedSqlDBType,
} from "#interface";
import { MysqlService } from "./db/MysqlService";
import { NosqlDatabaseManager } from "./db/NosqlDatabaseManager";
import { INFRA_ERROR_CODES } from "#core/Constant";
import { ErrorHelper, DBHelper } from "#utils";

const NOSQL_DATABASE_TYPES: SupportedDatabaseType[] = ["redis"];

function checkSqlBasedConnection(databaseName: string, type: SupportedDatabaseType): void {
    if (NOSQL_DATABASE_TYPES.includes(type)) {
        throw ErrorHelper.getError(
            INFRA_ERROR_CODES.DATABASE_CONNECTION_CREATION_ERROR,
            `Try to create a connection on database '${databaseName}' failed.`,
            "Connection creation failed due to the target database does not support SQL connection. Please use `TIANYU.db.nosql.*` to get a nosql supported connection.",
        );
    }
}

function createConnection(databaseName: string, config: IDatabaseConnectionConfig, type: SupportedDatabaseType): IDBConnection {
    checkSqlBasedConnection(databaseName, type);
    switch (type) {
        case "mysql":
        default:
            return new MysqlService(databaseName, DBHelper.converter.mysql(config));
    }
}

/** CSP Database Manager for global definition */
export class DatabaseManager implements IDatabaseManager {
    private _nosqlMgr: NosqlDatabaseManager;

    public constructor() {
        this._nosqlMgr = new NosqlDatabaseManager();
    }

    public get nosql(): INosqlDBManager {
        return this._nosqlMgr;
    }

    public connect(type: SupportedSqlDBType, databaseName: string, config: IDatabaseConnectionConfig): IDBConnection {
        return createConnection(databaseName, config, type);
    }
}
