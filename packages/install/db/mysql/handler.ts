/** @format */

import { IDBConnection, IDatabaseFieldDefine, TableIndexType } from "#interface";
import { Schema } from "./schema";
import { Table } from "./table";

export async function handleSchema(
    connection: IDBConnection,
    database: string,
    tables: {
        [table: string]: {
            fields: IDatabaseFieldDefine[];
            index?: TableIndexType;
            data: string[];
        };
    },
    destroy?: boolean,
): Promise<boolean> {
    const status = await Schema.exist(connection, database);
    if (status === "failed") {
        return false;
    }

    if (destroy && status === "exist") {
        const dropped = await Schema.drop(connection, database);
        if (!dropped) {
            return false;
        }
    }

    if (destroy || status === "unexist") {
        const created = await Schema.create(connection, database);
        if (!created) {
            return false;
        }
    }

    for (const table of Object.keys(tables)) {
        const tableResult = await Table.create(connection, database, table, tables[table]);
        if (!tableResult) {
            return false;
        }
    }

    return true;
}

export async function handleSchemaDrop(connection: IDBConnection, database: string): Promise<boolean> {
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
    return true;
}

export async function handleSchemaClean(
    connection: IDBConnection,
    database: string,
    tables: {
        [table: string]: {
            fields: IDatabaseFieldDefine[];
            index?: TableIndexType;
            data: string[];
        };
    },
): Promise<boolean> {
    const status = await Schema.exist(connection, database);
    if (status === "failed" || status === "unexist") {
        return false;
    }

    for (const table of Object.keys(tables)) {
        const tableResult = await Table.exist(connection, database, table);
        if (tableResult === "failed") {
            return false;
        }
        if (tableResult === "exist") {
            const status = await Table.clean(connection, database, table);
            if (!status) {
                return false;
            }
        }
    }

    return true;
}

export async function handleSchemaInsert(
    connection: IDBConnection,
    database: string,
    tables: {
        [table: string]: {
            fields: IDatabaseFieldDefine[];
            index?: TableIndexType;
            data: string[];
        };
    },
): Promise<boolean> {
    const status = await Schema.exist(connection, database);
    if (status === "failed" || status === "unexist") {
        return false;
    }

    for (const table of Object.keys(tables)) {
        const tableResult = await Table.exist(connection, database, table);
        if (tableResult === "failed") {
            return false;
        }
        if (tableResult === "exist") {
            const status = await Table.insert(connection, database, table, tables[table].data);
            if (!status) {
                return false;
            }
        }
    }

    return true;
}
