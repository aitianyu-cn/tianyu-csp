/** @format */

import { RedisDatabaseQuery, RedisSupportedCommander, RedisValueType } from "#interface";
import { DATABASE_TABLES_MAP } from "../../Common";
import { ObjectHelper } from "../ObjectHelper";
import { RedisCommander } from "ioredis";

export const RedisHelper = {
    format: function (cmd: keyof RedisSupportedCommander, db: string, table: string, value: string): string {
        const redisQuery: RedisDatabaseQuery = { cmd, db, table, value };
        return JSON.stringify(redisQuery);
    },
    parse: function (query: string): RedisDatabaseQuery {
        const raw = ObjectHelper.parse<RedisDatabaseQuery>(query);
        return {
            cmd: raw?.cmd || "unknown",
            db: raw?.db || "",
            table: raw?.table || "",
            value: raw?.value || "",
        };
    },

    struct: function (database: string, table: string): { key: string[]; type: RedisValueType } {
        const result: { key: string[]; type: RedisValueType } = { key: [], type: "string" };
        const tableDef = DATABASE_TABLES_MAP.find((value) => value.database === database && value.table === table);
        if (tableDef) {
            for (const field of Object.values(tableDef.field)) {
                field.primary && result.key.push(field.name);
            }

            if (!result.key.length) {
                result.type = "list";
                result.key = [];
            }
        }

        return result;
    },
};
