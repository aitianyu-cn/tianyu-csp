/** @format */

import { DatabaseConfig, IDatabaseConnectionConfig, IDatabaseManager, IDBConnection, SupportedDatabaseType } from "#interface";
import { MysqlService } from "./db/MysqlService";
import { DBHelper } from "#utils/DBHelper";
import { RedisService } from "./db/RedisService";

function createConnection(databaseName: string, config: IDatabaseConnectionConfig, type: SupportedDatabaseType): IDBConnection {
    switch (type) {
        case "redis":
            return new RedisService(databaseName, DBHelper.converter.redis(config, databaseName));
        case "mysql":
        default:
            return new MysqlService(databaseName, DBHelper.converter.mysql(config));
    }
}

export class DatabaseManager implements IDatabaseManager {
    private _config: DatabaseConfig;

    public constructor(config: DatabaseConfig) {
        this._config = config;
    }

    public connect(databaseName: string): IDBConnection {
        const type = this.databaseType(databaseName);
        return createConnection(databaseName, this._config.configMap[databaseName] || {}, type);
    }

    public databaseType(databaseName: string): SupportedDatabaseType {
        return this._config.dbTypes[databaseName] || "mysql";
    }
}
