/** @format */

import { ITrace, SupportedDatabaseType, TraceArea } from "#interface";
import { DATABASE_SYS_DB_MAP } from "../../Common";
import { DEFAULT_SYS_DB_MAP } from "./Constant";
import { TraceHelper } from "#utils/TraceHelper";
import { DBHelper } from "#utils/DBHelper";
import { ObjectHelper } from "#utils/ObjectHelper";

const TemplateSQL: { [key in SupportedDatabaseType]: string } = {
    mysql: "INSERT INTO `{0}`.`{1}` (`{2}`, `{3}`, `{4}`, `{5}`, `{6}`, '{7}') VALUES('{8}', '{9}', '{10}', '{11}', '{12}', '{13}');",
    redis: DBHelper.redis.format(
        "lpush",
        "{0}",
        "{1}",
        ObjectHelper.stringify({ "{2}": "{8}", "{3}": "{9}", "{4}": "{10}", "{5}": "{11}", "{6}": "{12}", "{7}": "{13}" }),
    ),
};

export class TraceManager implements ITrace {
    private _traceId: string;

    public constructor() {
        this._traceId = "";
    }

    public getId(): string {
        return this._traceId;
    }
    public setId(id: string): void {
        this._traceId = id;
    }
    public async trace(message: string, errorDetails?: string, area?: TraceArea): Promise<void> {
        const dbInfo = DATABASE_SYS_DB_MAP["trace"] || /* istanbul ignore next */ DEFAULT_SYS_DB_MAP["trace"];
        const sql = DBHelper.format(TemplateSQL[TIANYU.db.databaseType(dbInfo.database)], [
            dbInfo.database,
            dbInfo.table,

            dbInfo.field.user.name,
            dbInfo.field.id.name,
            dbInfo.field.time.name,
            dbInfo.field.msg.name,
            dbInfo.field.error.name,
            dbInfo.field.area.name,

            TIANYU.session.user.userId,
            this._traceId,
            TraceHelper.generateTime(),
            message,
            errorDetails || "",
            area || "edge",
        ]);
        const connection = TIANYU.db.connect(dbInfo.database);
        await connection
            .execute(sql)
            .catch((error) => {
                TIANYU.logger.error(JSON.stringify(error));
            })
            .finally(() => {
                connection.close();
            });
    }
}
