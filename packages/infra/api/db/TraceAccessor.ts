/** @format */

import { LogLevel } from "@aitianyu.cn/types";
import { ITraceConfig, ITraceDBRecord, TraceArea } from "../interface/Trace";
import { LogHelper } from "../utils/LogHelper";
import { TemplateSQL } from "./sql/TraceSql";
import { IRuntimeManager } from "../interface/RuntimeMgr";
import { clearDBTable, executeDBCustom, pushDBRecord, selectDBCount } from "./CommonAccessor";
import { RecordsResult } from "../interface/Declars";
import { FilterHelper } from "../utils/FilterHelper";

async function pushTrace(runtime: IRuntimeManager, message: string, level: LogLevel, config: ITraceConfig): Promise<void> {
    const { dbName } = runtime.db.mappingTable("trace");
    const { user } = runtime.session.getInfo();

    return pushDBRecord(
        runtime,
        TemplateSQL["push"][runtime.db.databaseType(dbName)],
        [user.id, config.id, level.toString(), LogHelper.generateTime(), message, config.error || "", config.area || "edge"],
        "trace",
    );
}

async function selectTraceCount(runtime: IRuntimeManager): Promise<number> {
    return searchTraceCount(runtime, FilterHelper.format(runtime));
}

async function selectTraceRecords(runtime: IRuntimeManager, start: number, count: number): RecordsResult<ITraceDBRecord[]> {
    return searchTraceRecords(runtime, start, count, FilterHelper.format(runtime));
}

async function clearTrace(runtime: IRuntimeManager): Promise<void> {
    return clearDBTable(runtime, "trace");
}

async function searchTraceCount(runtime: IRuntimeManager, filter: string): Promise<number> {
    return selectDBCount(runtime, "trace", filter);
}

async function searchTraceRecords(
    runtime: IRuntimeManager,
    start: number,
    count: number,
    filter: string,
): RecordsResult<ITraceDBRecord[]> {
    const { dbName } = runtime.db.mappingTable("trace");

    return executeDBCustom(
        runtime,
        TemplateSQL["select"][runtime.db.databaseType(dbName)],
        [count.toString(), start.toString(), filter],
        "trace",
    ).then(
        async (result: any) => {
            const records: ITraceDBRecord[] = [];
            if (Array.isArray(result) && result.length) {
                for (const item of result) {
                    records.push({
                        user: item["user"],
                        id: item["id"],
                        level: item["id"] as LogLevel,
                        time: item["time"],
                        msg: item["msg"],
                        error: item["error"],
                        area: item["area"] as TraceArea,
                    });
                }
            }

            return Promise.resolve({ records, start, end: start + count - 1 });
        },
        async (error) => Promise.reject(error),
    );
}

export {
    pushTrace as push,
    clearTrace as clear,
    selectTraceCount as count,
    selectTraceRecords as getTraces,
    searchTraceCount as getSearchCount,
    searchTraceRecords as getSearchTraces,
};
