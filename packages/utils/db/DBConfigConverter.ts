/** @format */

import { IDatabaseConnectionConfig } from "#interface";
import { RedisOptions } from "ioredis";
import * as mysql from "mysql";
import { RedisConverter } from "./RedisConverter";

export const DBConfigConverter = {
    mysql: function (config: IDatabaseConnectionConfig): mysql.ConnectionConfig {
        return Object.assign({}, config);
    },
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
