/** @format */

import { GenericDatabaseTable, IDatabaseConnectionConfig, IDatabaseInstallConfig, SupportedDatabaseType } from "#interface";
import { MapOfType } from "@aitianyu.cn/types";
import { SqlDataProcessor } from "./sql-data-processor";

export class SqlConfigProcessor {
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
                    data: SqlDataProcessor.process(
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
