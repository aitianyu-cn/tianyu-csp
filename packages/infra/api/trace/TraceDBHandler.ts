/** @format */

import { LogLevel, StringHelper } from "@aitianyu.cn/types";
import { OperationFailed, FATAL_ERROR_EXIT_CODE } from "../Constant";
import { DATABASE_EXECUTION_ERROR_CODE, SupportedDatabaseType } from "../db";
import { ITraceConfig } from "./ITrace";
import { LogHelper } from "../utils/LogHelper";
import { InfraDB } from "../db/Configuration";

const TemplateSQL: {
    [dbType in SupportedDatabaseType]: string;
} = {
    mysql: "INSERT INTO `{0}`.`{1}` (`id`, `level`, `time`, `msg`, `error`, `area`) VALUES('{2}', '{3}', '{4}', '{5}', '{6}', '{7}');",
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

export function pushTrace(message: string, level: LogLevel, config: ITraceConfig): void {
    const timeString = LogHelper.generateTime();
    const { dbName, tableMapping } = InfraDB.translateTable("trace");
    const sql = StringHelper.format(TemplateSQL[InfraDB.databaseType(dbName)], [
        dbName,
        tableMapping,
        config.id,
        level,
        timeString,
        message,
        config.error || "",
        config.area || "edge",
    ]);

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
