/** @format */

import { IDatabaseConnectionConfig } from "#interface";
import { RedisOptions } from "ioredis";
import * as mysql from "mysql";

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

        {
            const database2Index = Number(database.match(/[0-9]+/)?.[0]);
            options.db = Number.isNaN(database2Index) ? 0 : database2Index > 15 || database2Index < 0 ? 0 : database2Index;
            // for more configs will be supported in the feature
        }

        return options;
    },
};
