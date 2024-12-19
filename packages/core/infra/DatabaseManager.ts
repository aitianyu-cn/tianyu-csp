/** @format */

import {
    DatabaseConfig,
    IDatabaseConnectionConfig,
    IDatabaseManager,
    IDBConnection,
    INosqlDBManager,
    SupportedDatabaseType,
} from "#interface";
import { MysqlService } from "./db/MysqlService";
import { DBHelper } from "#utils/DBHelper";
import { NosqlDatabaseManager } from "./db/NosqlDatabaseManager";
import { ErrorHelper } from "#utils/ErrorHelper";
import { INFRA_ERROR_CODES } from "#core/Constant";

const NOSQL_DATABASE_TYPES: SupportedDatabaseType[] = ["redis"];

function checkSqlBasedConnection(databaseName: string, type: SupportedDatabaseType): void {
    if (type in NOSQL_DATABASE_TYPES) {
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

export class DatabaseManager implements IDatabaseManager {
    private _config: DatabaseConfig;
    private _nosqlMgr: NosqlDatabaseManager;

    public constructor(config: DatabaseConfig) {
        this._config = config;
        this._nosqlMgr = new NosqlDatabaseManager(this._config.configMap);
    }

    public get nosql(): INosqlDBManager {
        return this._nosqlMgr;
    }

    public connect(databaseName: string): IDBConnection {
        const type = this.databaseType(databaseName);
        return createConnection(databaseName, this._config.configMap[databaseName] || {}, type);
    }

    public databaseType(databaseName: string): SupportedDatabaseType {
        return this._config.dbTypes[databaseName] || "mysql";
    }
}
