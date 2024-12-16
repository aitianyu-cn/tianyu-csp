/** @format */

import { IDatabaseInstallConfig } from "#interface";
import { MapOfType } from "@aitianyu.cn/types";
import { DATABASE_CONFIGS_MAP, DATABASE_CUSTOM_MAP, DATABASE_SYS_DB_MAP, DATABASE_TYPES_MAP } from "../../../Common";

export class ConfigProcessor {
    public static process(): MapOfType<IDatabaseInstallConfig> {
        const config: MapOfType<IDatabaseInstallConfig> = {};

        for (const dbName of Object.keys(DATABASE_TYPES_MAP)) {
            if (!config[DATABASE_TYPES_MAP[dbName]]) {
                config[DATABASE_TYPES_MAP[dbName]] = {};
            }
            if (DATABASE_CONFIGS_MAP[dbName]) {
                config[DATABASE_TYPES_MAP[dbName]][dbName] = {
                    config: DATABASE_CONFIGS_MAP[dbName],
                    tables: {},
                };
            }
        }

        for (const table of Object.values(DATABASE_SYS_DB_MAP)) {
            if (DATABASE_TYPES_MAP[table.database] && config[DATABASE_TYPES_MAP[table.database]][table.database]) {
                config[DATABASE_TYPES_MAP[table.database]][table.database].tables[table.table] = {
                    fields: Object.values(table.field),
                    index: table.index,
                };
            }
        }

        for (const table of DATABASE_CUSTOM_MAP) {
            if (DATABASE_TYPES_MAP[table.database] && config[DATABASE_TYPES_MAP[table.database]][table.database]) {
                config[DATABASE_TYPES_MAP[table.database]][table.database].tables[table.table] = {
                    fields: Object.values(table.field),
                    index: table.index,
                };
            }
        }

        return config;
    }
}
