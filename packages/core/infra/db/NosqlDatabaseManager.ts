/** @format */

import { INFRA_ERROR_CODES } from "#core/Constant";
import { IDatabaseConnectionConfig, INosqlDBManager } from "#interface";
import { DBHelper } from "#utils/DBHelper";
import { ErrorHelper } from "#utils/ErrorHelper";
import { MapOfType } from "@aitianyu.cn/types";
import Redis from "ioredis";

export class NosqlDatabaseManager implements INosqlDBManager {
    private _config: MapOfType<IDatabaseConnectionConfig>;

    public constructor(config: MapOfType<IDatabaseConnectionConfig>) {
        this._config = config;
    }

    redis(database: string, config?: IDatabaseConnectionConfig): Redis {
        if (!database) {
            throw ErrorHelper.getError(
                INFRA_ERROR_CODES.DATABASE_CONNECTION_CREATION_ERROR,
                `Redis try to connect to an invalid database. Database name should not be emtpy.`,
            );
        }
        const type = TIANYU.db.databaseType(database);
        if (type !== "redis") {
            throw ErrorHelper.getError(
                INFRA_ERROR_CODES.DATABASE_CONNECTION_CREATION_ERROR,
                `Redis could not connect to '${database}' due to target database bases on '${type}' that not is a redis instance.`,
            );
        }
        const rawConf: IDatabaseConnectionConfig | null = config || this._config[database] || null;
        if (!rawConf) {
            throw ErrorHelper.getError(
                INFRA_ERROR_CODES.DATABASE_CONNECTION_CREATION_ERROR,
                `Redis database '${database}' could not be found in configuration definition.`,
            );
        }
        const conf4Redis = DBHelper.converter.redis(rawConf, database);
        return new Redis(conf4Redis);
    }
}
