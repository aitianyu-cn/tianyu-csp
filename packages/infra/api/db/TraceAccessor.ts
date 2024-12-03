/** @format */

import { LogLevel, StringHelper } from "@aitianyu.cn/types";
import {
    DATABASE_EXECUTION_ERROR_CODE,
    EXIT_CODES,
    INFRA_DEFAULT_PRIVILEGE_LIST,
    GENERAL_OPERATION_ERROR_CODE,
    GlobalTemplateSQL,
} from "../Constant";
import { OperationFailed } from "../interface/Declars";
import { ITraceConfig, ITraceDBRecord, TraceArea } from "../interface/Trace";
import { InfraDB } from "../utils/InfraDB";
import { InfraSession } from "../utils/InfraSession";
import { LogHelper } from "../utils/LogHelper";
import { TraceHelper } from "../utils/TraceHelper";
import { TemplateSQL } from "./sql/LogSql";
import { pushUsage } from "./UsageAccessor";

export function pushTrace(sessionId: string, message: string, level: LogLevel, config: ITraceConfig): void {
    const timeString = LogHelper.generateTime();
    const { dbName, tableMapping } = InfraDB.translateTable("trace");
    const { user } = InfraSession.getSessionInfo(sessionId);
    const sql = StringHelper.format(TemplateSQL["push"][InfraDB.databaseType(dbName)], [
        user.id,
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
            success: () => {
                // nothing to do when success
            },
            failed: (error) => {
                if (error.code === DATABASE_EXECUTION_ERROR_CODE.DB_CORE_ERROR) {
                    process.exit(EXIT_CODES.FATAL_ERROR);
                }
            },
        },
        true,
    );
}

export async function selectTraceCount(sessionId: string): Promise<number> {
    pushUsage(sessionId, "infra", "trace", "Read", `Read Trace Records Counts.`);

    const { dbName, tableMapping } = InfraDB.translateTable("trace");
    const { user } = InfraSession.getSessionInfo(sessionId);

    const adminMode = user.admin;
    const privilege = adminMode || InfraSession.checkPrivilege(user.id, INFRA_DEFAULT_PRIVILEGE_LIST.TRACE.key, "Read");
    if (!privilege) {
        return Promise.reject({
            code: GENERAL_OPERATION_ERROR_CODE.OPERATION_NO_PRIVILEGE,
            message: `Operation: 'Read Trace' is not permitted for user '${user.name}', please check privilege of this user or apply the author from who has this privilege.`,
            error: "Read Trace",
        } as OperationFailed);
    }

    const sql = StringHelper.format(GlobalTemplateSQL["count"][InfraDB.databaseType(dbName)], [
        dbName,
        tableMapping,
        // in admin mode, to get all trace data of all users
        // not in admin mode, to get trace data of current user
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
                            `Error Code: ${error.code}, read trace counts from database failed`,
                            LogLevel.ERROR,
                            {
                                id: TraceHelper.generateTraceId("infra", "trace"),
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

export async function selectTraceRecords(sessionId: string, start: number, count: number): Promise<ITraceDBRecord[]> {
    const { dbName, tableMapping } = InfraDB.translateTable("trace");
    const { user } = InfraSession.getSessionInfo(sessionId);

    const adminMode = user.admin;
    const privilege = adminMode || InfraSession.checkPrivilege(user.id, INFRA_DEFAULT_PRIVILEGE_LIST.TRACE.key, "Read");
    if (!privilege) {
        return Promise.reject({
            code: GENERAL_OPERATION_ERROR_CODE.OPERATION_NO_PRIVILEGE,
            message: `Operation: 'Read Trace' is not permitted for user '${user.name}', please check privilege of this user or apply the author from who has this privilege.`,
            error: "Read Trace",
        } as OperationFailed);
    }

    pushUsage(
        sessionId,
        "infra",
        "trace",
        "Read",
        `Read Trace Records from ${start} to ${start + count - 1} by USER - ${user.id} - ${user.name} in ${
            adminMode ? "Admin" : "Restrict"
        } MODE.`,
    );

    const sql = StringHelper.format(TemplateSQL["select"][InfraDB.databaseType(dbName)], [
        dbName,
        tableMapping,
        count,
        start,
        // in admin mode, to get all trace data of all users
        // not in admin mode, to get trace data of current user
        adminMode ? "true" : "`user` = '" + user.id + "'",
    ]);

    const connection = InfraDB.getConnection(dbName);
    return new Promise<ITraceDBRecord[]>((resolve, reject) => {
        connection.execute(
            dbName,
            sql,
            {
                success: (result) => {
                    const records: ITraceDBRecord[] = [];
                    if (Array.isArray(result) && result.length) {
                        for (const item of result) {
                            records.push({
                                id: item["id"],
                                level: item["id"] as LogLevel,
                                time: item["time"],
                                msg: item["msg"],
                                error: item["error"],
                                area: item["area"] as TraceArea,
                            });
                        }
                    }

                    resolve(records);
                },
                failed: (error) => {
                    if (error.code === DATABASE_EXECUTION_ERROR_CODE.DB_CORE_ERROR) {
                        process.exit(EXIT_CODES.FATAL_ERROR);
                    } else {
                        pushTrace(
                            sessionId,
                            `Error Code: ${error.code}, read trace counts from database failed`,
                            LogLevel.ERROR,
                            {
                                id: TraceHelper.generateTraceId("infra", "trace"),
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

export async function clearTrace(sessionId: string): Promise<boolean> {
    const { dbName, tableMapping } = InfraDB.translateTable("trace");
    const { user } = InfraSession.getSessionInfo(sessionId);

    const adminMode = user.admin;
    const privilege = adminMode || InfraSession.checkPrivilege(user.id, INFRA_DEFAULT_PRIVILEGE_LIST.TRACE.key, "Delete");
    if (!privilege) {
        return Promise.reject({
            code: GENERAL_OPERATION_ERROR_CODE.OPERATION_NO_PRIVILEGE,
            message: `Operation: 'Clear Trace' is not permitted for user '${user.name}', please check privilege of this user or apply the author from who has this privilege.`,
            error: "Clear Trace",
        } as OperationFailed);
    }

    pushUsage(
        sessionId,
        "infra",
        "trace",
        "Delete",
        `Delete Trace Records for USER - ${user.id} - ${user.name} in ${adminMode ? "Admin" : "Restrict"} MODE. ${
            adminMode ? "Remove All Records" : ""
        }`,
    );
    const sql = StringHelper.format(GlobalTemplateSQL[adminMode ? "clear" : "delete"][InfraDB.databaseType(dbName)], [
        dbName,
        tableMapping,
        user.id,
    ]);

    const connection = InfraDB.getConnection(dbName);
    return new Promise<boolean>((resolve) => {
        connection.execute(
            dbName,
            sql,
            {
                success: () => {
                    resolve(true);
                },
                failed: (error) => {
                    if (error.code === DATABASE_EXECUTION_ERROR_CODE.DB_CORE_ERROR) {
                        process.exit(EXIT_CODES.FATAL_ERROR);
                    }
                    resolve(false);
                },
            },
            true,
        );
    });
}
