/** @format */

import {
    DatabaseConfig,
    IDatabaseConnectionConfig,
    IDatabaseManager,
    IDBConnection,
    IDBLifecycle,
    SupportedDatabaseType,
} from "#interface";
import { MapOfType } from "@aitianyu.cn/types";
import { MysqlService } from "./db/MysqlService";
import { DBConfigConverter } from "#utils/DBConfigConverter";

function createConnection(
    databaseName: string,
    config: IDatabaseConnectionConfig,
    type: SupportedDatabaseType,
): IDBConnection & IDBLifecycle {
    switch (type) {
        case "mysql":
        default:
            return new MysqlService(databaseName, DBConfigConverter.toMysql(config));
    }
}

export class DatabaseManager implements IDatabaseManager {
    private _config: DatabaseConfig;

    private _connectionMap: MapOfType<IDBConnection & IDBLifecycle>;

    public constructor(config: DatabaseConfig) {
        this._config = config;
        this._connectionMap = {};
    }

    public connect(databaseName: string): IDBConnection {
        if (!this._connectionMap[databaseName]) {
            const type = this.databaseType(databaseName);
            this._connectionMap[databaseName] = createConnection(databaseName, this._config.configMap[databaseName] || {}, type);
        }

        return this._connectionMap[databaseName];
    }

    public databaseType(databaseName: string): SupportedDatabaseType {
        return this._config.dbTypes[databaseName] || "mysql";
    }

    public close(): void {
        for (const key of Object.keys(this._connectionMap)) {
            const connection = this._connectionMap[key];
            connection.close();
        }

        this._connectionMap = {};
    }
}
