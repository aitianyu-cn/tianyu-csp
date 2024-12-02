/** @format */

import { Log, LogLevel, StringHelper } from "@aitianyu.cn/types";
import { RuntimeHelper } from "../utils/RuntimeHelper";
import { DATABASE_EXECUTION_ERROR_CODE, SupportedDatabaseType } from "../db";
import { InfraDB } from "../db/Configuration";
import { FATAL_ERROR_EXIT_CODE, OperationFailed } from "../Constant";
import { LogHelper } from "../utils/LogHelper";

const TemplateSQL: {
    [dbType in SupportedDatabaseType]: string;
} = {
    mysql: "INSERT INTO `{0}`.`{1}` (`level`, `time`, `msg`) VALUES('{2}', '{3}', '{4}');",
};

function executionSuccess(): void {
    // nothing to do when success
}
function executionFailed(error: {} & OperationFailed): void {
    // when fatal core error occurs, exit application to aviod the further errors.
    if (error.code === DATABASE_EXECUTION_ERROR_CODE.DB_CORE_ERROR) {
        process.exit(FATAL_ERROR_EXIT_CODE);
    }
}

export function pushLog(msg: string, level: LogLevel, timer: boolean): void {
    if (!RuntimeHelper.isProduction) {
        Log.log(msg, level, timer);
    }

    const timeString = LogHelper.generateTime();
    const { dbName, tableMapping } = InfraDB.translateTable("logger");
    const sql = StringHelper.format(TemplateSQL[InfraDB.databaseType(dbName)], [dbName, tableMapping, level, timeString, msg]);

    const connection = InfraDB.getConnection(dbName);
    connection.execute(
        dbName,
        sql,
        {
            success: executionSuccess,
            failed: executionFailed,
        },
        true,
    );
}
