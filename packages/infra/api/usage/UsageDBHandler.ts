/** @format */

import { StringHelper } from "@aitianyu.cn/types";
import { OperationFailed, FATAL_ERROR_EXIT_CODE, OperationActions, ProjectDefine } from "../Constant";
import { DATABASE_EXECUTION_ERROR_CODE, SupportedDatabaseType } from "../db";
import { InfraDB } from "../db/Configuration";
import { LogHelper } from "../utils/LogHelper";

const TemplateSQL: {
    [dbType in SupportedDatabaseType]: string;
} = {
    mysql: "INSERT INTO `{0}`.`{1}` (`project`, `module`, `action`, `time`, `msg`) VALUES('{2}', '{3}', '{4}', '{5}', '{6}');",
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

export function pushUsage(project: ProjectDefine, moduleName: string, action: OperationActions, msg?: string): void {
    const timeString = LogHelper.generateTime();
    const { dbName, tableMapping } = InfraDB.translateTable("logger");
    const sql = StringHelper.format(TemplateSQL[InfraDB.databaseType(dbName)], [
        dbName,
        tableMapping,
        project,
        moduleName,
        action,
        timeString,
        msg || "",
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
