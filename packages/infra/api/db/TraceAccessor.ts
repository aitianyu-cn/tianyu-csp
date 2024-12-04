/** @format */

import { LogLevel } from "@aitianyu.cn/types";
import { ITraceConfig, ITraceDBRecord, TraceArea } from "../interface/Trace";
import { LogHelper } from "../utils/LogHelper";
import { TemplateSQL } from "./sql/TraceSql";
import { IRuntimeManager } from "../interface/RuntimeMgr";
import { clearDBTable, pushDBRecord, selectDBCount, selectDBRecords } from "./CommonAccessor";

export async function pushTrace(runtime: IRuntimeManager, message: string, level: LogLevel, config: ITraceConfig): Promise<void> {
    const { dbName } = runtime.db.mappingTable("trace");
    const { user } = runtime.session.getInfo();

    return pushDBRecord(
        runtime,
        TemplateSQL["push"][runtime.db.databaseType(dbName)],
        [user.id, config.id, level.toString(), LogHelper.generateTime(), message, config.error || "", config.area || "edge"],
        "trace",
    );
}

export async function selectTraceCount(runtime: IRuntimeManager): Promise<number> {
    return selectDBCount(runtime, "trace");
}

export async function selectTraceRecords(runtime: IRuntimeManager, start: number, count: number): Promise<ITraceDBRecord[]> {
    const { dbName } = runtime.db.mappingTable("trace");

    return selectDBRecords(runtime, TemplateSQL["select"][runtime.db.databaseType(dbName)], start, count, "trace").then(
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

            return Promise.resolve(records);
        },
        async (error) => Promise.reject(error),
    );
}

export async function clearTrace(runtime: IRuntimeManager): Promise<void> {
    return clearDBTable(runtime, "trace");
}
