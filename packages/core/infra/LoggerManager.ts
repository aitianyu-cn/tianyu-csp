/** @format */

import { ILogger, SupportedDatabaseType } from "#interface";
import { Log, LogLevel } from "@aitianyu.cn/types";
import { DATABASE_SYS_DB_MAP, PROJECT_ENVIRONMENT_MODE } from "../../Common";
import { DEFAULT_SYS_DB_MAP } from "./Constant";
import { TraceHelper } from "#utils/TraceHelper";
import { DBHelper } from "#utils/DBHelper";

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
        const dbinfo = DATABASE_SYS_DB_MAP["logger"] || /* istanbul ignore next */ DEFAULT_SYS_DB_MAP["logger"];
        this._db = dbinfo.database;
        this._tb = dbinfo.table;

        this._field_user = dbinfo.field.user.name;
        this._field_level = dbinfo.field.level.name;
        this._field_time = dbinfo.field.time.name;
        this._field_msg = dbinfo.field.msg.name;
    }

    public async log(msg: string, level?: LogLevel): Promise<void> {
        TIANYU.environment.development && Log.log(msg, level, true);

        const sql = DBHelper.format(TemplateSQL[TIANYU.db.databaseType(this._db)], [
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
            .catch(() => {})
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
        return PROJECT_ENVIRONMENT_MODE === "development"
            ? this.log(msg, LogLevel.DEBUG)
            : /* istanbul ignore next */ Promise.resolve();
    }
    public async error(msg: string): Promise<void> {
        return this.log(msg, LogLevel.ERROR);
    }
    public async fatal(msg: string): Promise<void> {
        return this.log(msg, LogLevel.FATAL);
    }
}
