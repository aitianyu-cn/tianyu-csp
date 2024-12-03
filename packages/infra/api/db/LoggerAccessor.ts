/** @format */

import { Log, LogLevel, StringHelper } from "@aitianyu.cn/types";
import { RuntimeHelper } from "../utils/RuntimeHelper";
import { LogHelper } from "../utils/LogHelper";
import { DATABASE_EXECUTION_ERROR_CODE, EXIT_CODES } from "../Constant";
import { InfraDB } from "../utils/InfraDB";
import { TemplateSQL } from "./sql/LogSql";

export function pushLog(sessionId: string, msg: string, level: LogLevel, timer: boolean): void {
    if (!RuntimeHelper.isProduction) {
        Log.log(msg, level, timer);
    }

    const timeString = LogHelper.generateTime();
    const { dbName, tableMapping } = InfraDB.translateTable("logger");
    const sql = StringHelper.format(TemplateSQL["push"][InfraDB.databaseType(dbName) as string], [
        dbName,
        tableMapping,
        level,
        timeString,
        msg,
    ]);

    const connection = InfraDB.getConnection(dbName);
    connection.execute(
        dbName,
        sql,
        {
            success: () => {
                // nothing to do when success
            },
            failed: (error) => {
                // when fatal core error occurs, exit application to aviod the further errors.
                if (error.code === DATABASE_EXECUTION_ERROR_CODE.DB_CORE_ERROR) {
                    process.exit(EXIT_CODES.FATAL_ERROR);
                }
            },
        },
        true,
    );
}
