/** @format */

import { INFRA_ERROR_CODES } from "#core/Constant";
import { IDatabaseConnectionConfig, INosqlDBManager } from "#interface";
import { ErrorHelper, DBHelper } from "#utils";
import Redis from "ioredis";

/** no-sql database manager */
export class NosqlDatabaseManager implements INosqlDBManager {
    public constructor() {}

    redis(database: string, config?: IDatabaseConnectionConfig): Redis {
        if (!database) {
            throw ErrorHelper.getError(
                INFRA_ERROR_CODES.DATABASE_CONNECTION_CREATION_ERROR,
                `Redis try to connect to an invalid database. Database name should not be emtpy.`,
            );
        }
        if (!config) {
            throw ErrorHelper.getError(
                INFRA_ERROR_CODES.DATABASE_CONNECTION_CREATION_ERROR,
                `Redis database '${database}' could not be found in configuration definition.`,
            );
        }
        const conf4Redis = DBHelper.converter.redis(config, database);
        return new Redis(conf4Redis);
    }
}
