/** @format */

import { IDatabaseConnectionConfig } from "#interface";
import { RedisOptions } from "ioredis";
import * as mysql from "mysql";
import { RedisConverter } from "./RedisConverter";

/**
 * @public
 *
 * Converter of database configuration
 */
export const DBConfigConverter = {
    /**
     * To convert database connection config to be a mysql valid connection config
     *
     * @param config source config
     * @returns return a mysql config
     */
    mysql: function (config: IDatabaseConnectionConfig): mysql.ConnectionConfig {
        return Object.assign({}, config);
    },
    /**
     * To convert database connection config to be a redis valid connection config
     *
     * @param config source config
     * @param database the database id string
     * @returns return a redis config
     *
     * @example
     * The database name of redis is a number value to indicate the database index. but we also
     * accept a customized name because we can convert it and to get the id from it.
     * 1. pure number: "10" => 10
     * 2. database name: "database2" => 2
     *
     * @example
     * The database of redis only contains 16 databases, thus we can only accept number 0 to 15,
     * if the value is over 15 or less than 0, the 0 value will be assigned.
     */
    redis: function (config: IDatabaseConnectionConfig, database: string): RedisOptions {
        const options: RedisOptions = {};

        options.host = config.host || "localhost";
        options.port = config.port || 6379;
        options.username = config.user || "default";
        options.password = config.password;
        options.commandTimeout = config.timeout;

        {
            options.db = RedisConverter.getDatabase(database);

            // for more configs will be supported in the feature
        }

        return options;
    },
};
