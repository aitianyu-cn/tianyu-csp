/** @format */

import { StringHelper, LogLevel } from "@aitianyu.cn/types";
import {
    DATABASE_EXECUTION_ERROR_CODE,
    EXIT_CODES,
    INFRA_DEFAULT_PRIVILEGE_LIST,
    GENERAL_OPERATION_ERROR_CODE,
    GlobalTemplateSQL,
} from "../Constant";
import { OperationActions, OperationFailed } from "../interface/Declars";
import { InfraDB } from "../utils/InfraDB";
import { InfraSession } from "../utils/InfraSession";
import { LogHelper } from "../utils/LogHelper";
import { TraceHelper } from "../utils/TraceHelper";
import { TemplateSQL } from "./sql/TraceSql";
import { pushTrace } from "./TraceAccessor";

export function pushUsage(sessionId: string, project: string, moduleName: string, action: OperationActions, msg?: string): void {
    const timeString = LogHelper.generateTime();
    const { dbName, tableMapping } = InfraDB.translateTable("logger");
    const { user } = InfraSession.getSessionInfo(sessionId);
    const sql = StringHelper.format(TemplateSQL["push"][InfraDB.databaseType(dbName)], [
        user.id,
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

export async function selectUsageCount(sessionId: string): Promise<number> {
    pushUsage(sessionId, "infra", "usage", "Read", `Read Usage Records Counts.`);

    const { dbName, tableMapping } = InfraDB.translateTable("usage");
    const { user } = InfraSession.getSessionInfo(sessionId);

    const adminMode = user.admin;
    const privilege = adminMode || InfraSession.checkPrivilege(user.id, INFRA_DEFAULT_PRIVILEGE_LIST.USAGE.key, "Read");
    if (!privilege) {
        return Promise.reject({
            code: GENERAL_OPERATION_ERROR_CODE.OPERATION_NO_PRIVILEGE,
            message: `Operation: 'Read Usage' is not permitted for user '${user.name}', please check privilege of this user or apply the author from who has this privilege.`,
            error: "Read Usage",
        } as OperationFailed);
    }

    const sql = StringHelper.format(GlobalTemplateSQL["count"][InfraDB.databaseType(dbName)], [
        dbName,
        tableMapping,
        // in admin mode, to get all usage data of all users
        // not in admin mode, to get usage data of current user
        adminMode ? "true" : "`user` = '" + user.id + "'",
    ]);

    const connection = InfraDB.getConnection(dbName);
    return new Promise<number>((resolve, reject) => {
        connection.execute(
            dbName,
            sql,
            {
                success: (result) => {
                    resolve(Array.isArray(result) && result.length ? result[0]["count"] || 0 : 0);
                },
                failed: (error) => {
                    if (error.code === DATABASE_EXECUTION_ERROR_CODE.DB_CORE_ERROR) {
                        process.exit(EXIT_CODES.FATAL_ERROR);
                    } else {
                        pushTrace(
                            sessionId,
                            `Error Code: ${error.code}, read usage counts from database failed`,
                            LogLevel.ERROR,
                            {
                                id: TraceHelper.generateTraceId("infra", "usage"),
                                area: "core",
                            },
                        );
                    }
                    reject(error);
                },
            },
            true,
        );
    });
}
