/** @format */

import { IDBConnection, ILogger, SupportedDatabaseType } from "#interface";
import { LogLevel, StringHelper } from "@aitianyu.cn/types";
import { DATABASE_SYS_DB_MAP } from "../../Common";
import { DEFAULT_SYS_DB_MAP } from "./Constant";
import { TraceHelper } from "#utils/TraceHelper";

const TemplateSQL: { [key in SupportedDatabaseType]: string } = {
    mysql: "INSERT INTO `{0}`.`{1}` (`{2}`, `{3}`, `{4}`, `{5}`) VALUES('{6}', {7}, '{8}', '{9}');",
};

export class LoggerManager implements ILogger {
    private _db: string;
    private _tb: string;
    private _field_user: string;
    private _field_level: string;
    private _field_time: string;
    private _field_msg: string;

    public constructor() {
        const dbinfo = DATABASE_SYS_DB_MAP["logger"] || DEFAULT_SYS_DB_MAP["logger"];
        this._db = dbinfo.database;
        this._tb = dbinfo.table;

        this._field_user = dbinfo.field.user;
        this._field_level = dbinfo.field.level;
        this._field_time = dbinfo.field.time;
        this._field_msg = dbinfo.field.msg;
    }

    public async log(msg: string, level?: LogLevel): Promise<void> {
        const sql = StringHelper.format(TemplateSQL[TIANYU.db.databaseType(this._db)], [
            this._db,
            this._tb,

            this._field_user,
            this._field_level,
            this._field_time,
            this._field_msg,

            TIANYU.session.user.userId,
            level || LogLevel.DEBUG,
            TraceHelper.generateTime(),
            msg,
        ]);
        const connection = TIANYU.db.connect(this._db);
        await connection
            .execute(sql)
            .catch(() => {
                // for error, to ignore
            })
            .finally(() => {
                connection.close();
            });
    }
    public async info(msg: string): Promise<void> {
        return this.log(msg, LogLevel.INFO);
    }
    public async warn(msg: string): Promise<void> {
        return this.log(msg, LogLevel.WARNING);
    }
    public async debug(msg: string): Promise<void> {
        return this.log(msg, LogLevel.DEBUG);
    }
    public async error(msg: string): Promise<void> {
        return this.log(msg, LogLevel.ERROR);
    }
    public async fatal(msg: string): Promise<void> {
        return this.log(msg, LogLevel.FATAL);
    }
}
