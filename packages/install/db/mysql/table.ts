/** @format */

import { IDatabaseFieldDefine, IDBConnection, TableIndexType } from "#interface";
import { StringHelper, Log } from "@aitianyu.cn/types";
import { CHECK_TABLE_EXIST, CLEAN_TABLE, CREATE_TABLE } from "../sql/mysql";
import { Field } from "./field";
import { DBHelper } from "#utils/DBHelper";
import { StructurCheckStatus } from "./interface";

export class Table {
    public static async exist(connect: IDBConnection, database: string, table: string): Promise<StructurCheckStatus> {
        const sql = DBHelper.format(CHECK_TABLE_EXIST, [database, table]);
        const result: StructurCheckStatus = await connect.query(sql).then(
            (result) => {
                return Array.isArray(result) && result.length ? "exist" : "unexist";
            },
            (error) => {
                Log.error(`check table (${table}) exist status in database (${database}) failed: ${JSON.stringify(error)}`);
                return "failed";
            },
        );
        return result;
    }

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

    public static async clean(connection: IDBConnection, database: string, table: string): Promise<boolean> {
        const sql = StringHelper.format(CLEAN_TABLE, [database, table]);
        const status = await connection.execute(sql).then(
            () => true,
            (error) => {
                Log.error(`clean table ${table} in database ${database} failed: ${JSON.stringify(error)}`);
                return false;
            },
        );
        return status;
    }

    public static async insert(connection: IDBConnection, database: string, table: string, sqls: string[]): Promise<boolean> {
        if (!sqls.length) {
            return true;
        }

        return await connection.executeBatch(sqls).then(
            () => true,
            (error) => {
                Log.error(`insert data into table ${table} in database ${database} failed: ${JSON.stringify(error)}`);
                return false;
            },
        );
    }
}
