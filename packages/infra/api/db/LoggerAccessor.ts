/** @format */

import { Log, LogLevel } from "@aitianyu.cn/types";
import { RuntimeHelper } from "../utils/RuntimeHelper";
import { LogHelper } from "../utils/LogHelper";
import { TemplateSQL } from "./sql/LogSql";
import { IRuntimeManager } from "../interface/RuntimeMgr";
import { clearDBTable, pushDBRecord, selectDBCount, selectDBRecords } from "./CommonAccessor";
import { ILogDBRecord } from "../interface/Logger";

export async function pushLog(runtime: IRuntimeManager, msg: string, level: LogLevel, timer: boolean): Promise<void> {
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

export async function selectLogsCount(runtime: IRuntimeManager): Promise<number> {
    return selectDBCount(runtime, "logger");
}

export async function selectLogRecords(runtime: IRuntimeManager, start: number, count: number): Promise<ILogDBRecord[]> {
    const { dbName } = runtime.db.mappingTable("logger");

    return selectDBRecords(runtime, TemplateSQL["select"][runtime.db.databaseType(dbName)], start, count, "logger").then(
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

            return Promise.resolve(records);
        },
        async (error) => Promise.reject(error),
    );
}

export async function clearLogger(runtime: IRuntimeManager): Promise<void> {
    return clearDBTable(runtime, "logger");
}
