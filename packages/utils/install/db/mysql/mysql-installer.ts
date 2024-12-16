/** @format */

import { MysqlService } from "#core/infra/db/MysqlService";
import {
    IDatabaseConnectionConfig,
    IDatabaseFieldDefine,
    IDBConnection,
    IDatabaseInstallConfig,
    TableIndexType,
} from "#interface";
import { Table } from "./table";
import { Schema } from "./schema";

export async function mysqlProcessor(config: IDatabaseInstallConfig): Promise<boolean> {
    for (const db of Object.keys(config)) {
        const databaseConfig = config[db];

        const connection = new MysqlService(db, databaseConfig.config);
        const schemaStatus = await handleSchema(connection, db, databaseConfig.tables);
        connection.close();

        if (!schemaStatus) {
            return false;
        }
    }

    return true;
}

async function handleSchema(
    connection: IDBConnection,
    database: string,
    tables: {
        [table: string]: {
            fields: IDatabaseFieldDefine[];
            index?: TableIndexType;
        };
    },
): Promise<boolean> {
    const status = await Schema.exist(connection, database);
    if (status === "failed") {
        return false;
    }
    if (status === "exist") {
        const dropped = await Schema.drop(connection, database);
        if (!dropped) {
            return false;
        }
    }

    const created = await Schema.create(connection, database);
    if (!created) {
        return false;
    }

    for (const table of Object.keys(tables)) {
        const tableResult = await Table.create(connection, database, table, tables[table]);
        if (!tableResult) {
            return false;
        }
    }

    return true;
}
