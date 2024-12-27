/** @format */

import { IDBConnection } from "#interface";
import { DBHelper } from "#utils/DBHelper";
import { Log } from "@aitianyu.cn/types";
import { CHECK_DB_EXIST, CREATE_DATABASE, DROP_DATABASE } from "../sql/mysql";
import { StructurCheckStatus } from "./interface";

export class Schema {
    public static async exist(connect: IDBConnection, database: string): Promise<StructurCheckStatus> {
        const sql = DBHelper.format(CHECK_DB_EXIST, [database]);
        const result: StructurCheckStatus = await connect.query(sql).then(
            (result) => {
                return Array.isArray(result) && result.length ? "exist" : "unexist";
            },
            (error) => {
                Log.error(`check database exist status failed: ${JSON.stringify(error)}`);
                return "failed";
            },
        );
        return result;
    }

    public static async drop(connect: IDBConnection, database: string): Promise<boolean> {
        const sql = DBHelper.format(DROP_DATABASE, [database]);
        return connect.execute(sql).then(
            () => true,
            (error) => {
                Log.error(`drop database failed: ${JSON.stringify(error)}`);
                return false;
            },
        );
    }

    public static async create(connect: IDBConnection, database: string): Promise<boolean> {
        const sql = DBHelper.format(CREATE_DATABASE, [database]);
        return connect.execute(sql).then(
            () => true,
            (error) => {
                Log.error(`create database failed: ${JSON.stringify(error)}`);
                return false;
            },
        );
    }
}
