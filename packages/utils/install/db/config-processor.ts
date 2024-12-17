/** @format */

import {
    GenericDatabaseTable,
    IDatabaseConnectionConfig,
    IDatabaseFieldDefine,
    IDatabaseInstallConfig,
    SupportedDatabaseType,
} from "#interface";
import { MapOfType } from "@aitianyu.cn/types";
import { DATABASE_CONFIGS_MAP, DATABASE_CUSTOM_MAP, DATABASE_SYS_DB_MAP, DATABASE_TYPES_MAP } from "../../../Common";
import { DataProcessor } from "./data-processor";

export class ConfigProcessor {
    public static fromConfig(): MapOfType<IDatabaseInstallConfig> {
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
            const type = DATABASE_TYPES_MAP[table.database];
            if (type && config[type][table.database]) {
                const fieldValues: IDatabaseFieldDefine[] = Object.values(table.field);
                config[type][table.database].tables[table.table] = {
                    fields: fieldValues,
                    index: table.index,
                    data: DataProcessor.process(table.database, table.table, type, table.data || "", fieldValues),
                };
            }
        }

        for (const table of DATABASE_CUSTOM_MAP) {
            const type = DATABASE_TYPES_MAP[table.database];
            if (type && config[type][table.database]) {
                const fieldValues = Object.values(table.field);
                config[type][table.database].tables[table.table] = {
                    fields: fieldValues,
                    index: table.index,
                    data: DataProcessor.process(table.database, table.table, type, table.data || "", fieldValues),
                };
            }
        }

        return config;
    }

    public static process(
        configs: { [database: string]: { type: SupportedDatabaseType; config: IDatabaseConnectionConfig } },
        tables: GenericDatabaseTable[],
    ): MapOfType<IDatabaseInstallConfig> {
        const config: MapOfType<IDatabaseInstallConfig> = {};

        for (const dbName of Object.keys(configs)) {
            const type = configs[dbName].type;
            if (!config[type]) {
                config[type] = {};
            }
            if (configs[dbName].config) {
                config[type][dbName] = {
                    config: configs[dbName].config,
                    tables: {},
                };
            }
        }

        for (const table of tables) {
            if (configs[table.database]?.type && config[configs[table.database].type][table.database]) {
                const fieldValues = Object.values(table.field);
                config[configs[table.database].type][table.database].tables[table.table] = {
                    fields: fieldValues,
                    index: table.index,
                    data: DataProcessor.process(
                        table.database,
                        table.table,
                        configs[table.database].type,
                        table.data || "",
                        fieldValues,
                    ),
                };
            }
        }

        return config;
    }
}
