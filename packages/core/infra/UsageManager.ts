/** @format */

import { IUsage, OperationActions, SupportedDatabaseType } from "#interface";
import { StringHelper } from "@aitianyu.cn/types";
import { DATABASE_SYS_DB_MAP } from "../../Common";
import { DEFAULT_SYS_DB_MAP } from "./Constant";
import { TraceHelper } from "#utils/TraceHelper";

const TemplateSQL: { [key in SupportedDatabaseType]: string } = {
    mysql: "INSERT INTO `{0}`.`{1}` (`{2}`, `{3}`, `{4}`, `{5}`, `{6}`) VALUES('{7}', '{8}', '{9}', '{10}', '{11}');",
};

export class UsageManager implements IUsage {
    public async record(project: string, moduleOrFunctionName: string, action: OperationActions, msg?: string): Promise<void> {
        const dbInfo = DATABASE_SYS_DB_MAP["usage"] || DEFAULT_SYS_DB_MAP["usage"];
        const sql = StringHelper.format(TemplateSQL[TIANYU.db.databaseType(dbInfo.database)], [
            dbInfo.database,
            dbInfo.table,

            dbInfo.field.user,
            dbInfo.field.func,
            dbInfo.field.action,
            dbInfo.field.time,
            dbInfo.field.msg,

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
