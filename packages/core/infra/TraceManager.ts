/** @format */

import { ITrace, SupportedDatabaseType, TraceArea } from "#interface";
import { StringHelper } from "@aitianyu.cn/types";
import { DATABASE_SYS_DB_MAP } from "../../Common";
import { DEFAULT_SYS_DB_MAP } from "./Constant";
import { TraceHelper } from "#utils/TraceHelper";

const TemplateSQL: { [key in SupportedDatabaseType]: string } = {
    mysql: "INSERT INTO `{0}`.`{1}` (`{2}`, `{3}`, `{4}`, `{5}`, `{6}`, '{7}') VALUES('{8}', '{9}', '{10}', '{11}', '{12}', '{13}');",
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
        const sql = StringHelper.format(TemplateSQL[TIANYU.db.databaseType(dbInfo.database)], [
            dbInfo.database,
            dbInfo.table,

            dbInfo.field.user,
            dbInfo.field.id,
            dbInfo.field.time,
            dbInfo.field.msg,
            dbInfo.field.error,
            dbInfo.field.area,

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
