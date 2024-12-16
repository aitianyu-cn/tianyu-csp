/** @format */

import { IDatabaseFieldDefine, IDBConnection, TableIndexType } from "#interface";
import { StringHelper, Log } from "@aitianyu.cn/types";
import { CREATE_TABLE } from "../sql/mysql";
import { Field } from "./field";

export class Table {
    public static async create(
        connection: IDBConnection,
        database: string,
        table: string,
        table_info: {
            fields: IDatabaseFieldDefine[];
            index?: TableIndexType;
        },
    ): Promise<boolean> {
        const fieldSqlFormat = Field.format(database, table, table_info.fields, table_info.index);
        if (fieldSqlFormat) {
            const sql = StringHelper.format(CREATE_TABLE, [database, table, fieldSqlFormat]);
            const status = await connection.execute(sql).then(
                () => true,
                (error) => {
                    Log.error(`create table ${table} in database ${database} failed: ${JSON.stringify(error)}`);
                    return false;
                },
            );
            return status;
        }

        return true;
    }
}
