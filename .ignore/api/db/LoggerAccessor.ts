/** @format */

import { Log, LogLevel } from "@aitianyu.cn/types";
import { RuntimeHelper } from "../utils/RuntimeHelper";
import { LogHelper } from "../utils/LogHelper";
import { TemplateSQL } from "./sql/LogSql";
import { IRuntimeManager } from "../interface/RuntimeMgr";
import { clearDBTable, executeDBCustom, pushDBRecord, selectDBCount } from "./CommonAccessor";
import { ILogDBRecord } from "../interface/Logger";
import { RecordsResult } from "../interface/Declars";
import { FilterHelper } from "../utils/FilterHelper";

async function pushLog(runtime: IRuntimeManager, msg: string, level: LogLevel, timer: boolean): Promise<void> {
    if (!RuntimeHelper.isProduction) {
        Log.log(msg, level, timer);
    }

    const { dbName } = runtime.db.mappingTable("logger");
    const { user } = runtime.session.getInfo();

    return pushDBRecord(
        runtime,
        TemplateSQL["push"][runtime.db.databaseType(dbName)],
        [user.id, level.toString(), LogHelper.generateTime(), msg],
        "logger",
    );
}

async function selectLogsCount(runtime: IRuntimeManager): Promise<number> {
    return searchLogsCount(runtime, FilterHelper.format(runtime));
}

async function selectLogRecords(runtime: IRuntimeManager, start: number, count: number): RecordsResult<ILogDBRecord[]> {
    return searchLogRecords(runtime, start, count, FilterHelper.format(runtime));
}

async function clearLogger(runtime: IRuntimeManager): Promise<void> {
    return clearDBTable(runtime, "logger");
}

async function searchLogsCount(runtime: IRuntimeManager, filter: string): Promise<number> {
    return selectDBCount(runtime, "logger", filter);
}

async function searchLogRecords(
    runtime: IRuntimeManager,
    start: number,
    count: number,
    filter: string,
): RecordsResult<ILogDBRecord[]> {
    const { dbName } = runtime.db.mappingTable("logger");

    return executeDBCustom(
        runtime,
        TemplateSQL["select"][runtime.db.databaseType(dbName)],
        [count.toString(), start.toString(), filter],
        "logger",
    ).then(
        async (result: any) => {
            const records: ILogDBRecord[] = [];
            if (Array.isArray(result) && result.length) {
                for (const item of result) {
                    records.push({
                        user: item["user"],
                        level: item["level"] as LogLevel,
                        time: item["time"],
                        msg: item["msg"],
                    });
                }
            }

            return Promise.resolve({ records, start, end: start + count - 1 });
        },
        async (error) => Promise.reject(error),
    );
}

export {
    pushLog as push,
    clearLogger as clear,
    selectLogsCount as count,
    selectLogRecords as getLogs,
    searchLogsCount as getSearchCount,
    searchLogRecords as getSearchLogs,
};
