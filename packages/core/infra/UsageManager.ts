/** @format */

import { IUsage, OperationActions, SupportedDatabaseType } from "#interface";
import { DATABASE_SYS_DB_MAP } from "../../Common";
import { DEFAULT_SYS_DB_MAP } from "./Constant";
import { TraceHelper } from "#utils/TraceHelper";
import { DBHelper } from "#utils/DBHelper";
import { ObjectHelper } from "#utils/ObjectHelper";

const TemplateSQL: { [key in SupportedDatabaseType]: string } = {
    mysql: "INSERT INTO `{0}`.`{1}` (`{2}`, `{3}`, `{4}`, `{5}`, `{6}`) VALUES('{7}', '{8}', '{9}', '{10}', '{11}');",
    redis: DBHelper.redis.format(
        "lpush",
        "{0}",
        "{1}",
        ObjectHelper.stringify({ "{2}": "{7}", "{3}": "{8}", "{4}": "{9}", "{5}": "{10}", "{6}": "{11}" }),
    ),
};

export class UsageManager implements IUsage {
    public async record(project: string, moduleOrFunctionName: string, action: OperationActions, msg?: string): Promise<void> {
        const dbInfo = DATABASE_SYS_DB_MAP["usage"] || /* istanbul ignore next */ DEFAULT_SYS_DB_MAP["usage"];
        const sql = DBHelper.format(TemplateSQL[TIANYU.db.databaseType(dbInfo.database)], [
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
