/** @format */

import { IUsage, OperationActions, SupportedDatabaseType } from "#interface";
import { DATABASE_SYS_DB_MAP } from "../../Common";
import { DEFAULT_SYS_DB_MAP } from "./Constant";
import { TraceHelper } from "#utils/TraceHelper";
import { DBHelper } from "#utils/DBHelper";
import { InternalSqlTemplate } from "./interface";

const TemplateSQL: InternalSqlTemplate = {
    mysql: "INSERT INTO `{0}`.`{1}` (`{2}`, `{3}`, `{4}`, `{5}`, `{6}`) VALUES('{7}', '{8}', '{9}', '{10}', '{11}');",
    default: "INSERT INTO `{0}`.`{1}` (`{2}`, `{3}`, `{4}`, `{5}`, `{6}`) VALUES('{7}', '{8}', '{9}', '{10}', '{11}');",
};

export class UsageManager implements IUsage {
    public async record(project: string, moduleOrFunctionName: string, action: OperationActions, msg?: string): Promise<void> {
        const dbInfo = DATABASE_SYS_DB_MAP["usage"] || /* istanbul ignore next */ DEFAULT_SYS_DB_MAP["usage"];
        const sql = DBHelper.format(TemplateSQL[TIANYU.db.databaseType(dbInfo.database)] || TemplateSQL["default"], [
            dbInfo.database,
            dbInfo.table,

            dbInfo.field.user.name,
            dbInfo.field.func.name,
            dbInfo.field.action.name,
            dbInfo.field.time.name,
            dbInfo.field.msg.name,

            TIANYU.session.user.userId,
            `${project}#${moduleOrFunctionName}`,
            action,
            TraceHelper.generateTime(),
            msg || "",
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
