/** @format */

import { OperationActions, RecordsResult } from "../interface/Declars";
import { LogHelper } from "../utils/LogHelper";
import { TemplateSQL } from "./sql/UsageSql";
import { IRuntimeManager } from "../interface/RuntimeMgr";
import { IUsageDBRecord } from "../interface/Usage";
import { clearDBTable, executeDBCustom, pushDBRecord, selectDBCount } from "./CommonAccessor";
import { FilterHelper } from "../utils/FilterHelper";

async function pushUsage(
    runtime: IRuntimeManager,
    project: string,
    moduleName: string,
    action: OperationActions,
    msg?: string,
): Promise<void> {
    const { dbName } = runtime.db.mappingTable("usage");
    const { user } = runtime.session.getInfo();

    return pushDBRecord(
        runtime,
        TemplateSQL["push"][runtime.db.databaseType(dbName)],
        [user.id, project, moduleName, action, LogHelper.generateTime(), msg || ""],
        "usage",
    );
}

async function selectUsageCount(runtime: IRuntimeManager): Promise<number> {
    return searchUsageCount(runtime, FilterHelper.format(runtime));
}

async function selectUsageRecords(runtime: IRuntimeManager, start: number, count: number): RecordsResult<IUsageDBRecord[]> {
    return searchUsageRecords(runtime, start, count, FilterHelper.format(runtime));
}

async function clearUsage(runtime: IRuntimeManager): Promise<void> {
    return clearDBTable(runtime, "usage");
}

async function searchUsageCount(runtime: IRuntimeManager, filter: string): Promise<number> {
    return selectDBCount(runtime, "usage", filter);
}

async function searchUsageRecords(
    runtime: IRuntimeManager,
    start: number,
    count: number,
    filter: string,
): RecordsResult<IUsageDBRecord[]> {
    const { dbName } = runtime.db.mappingTable("usage");

    return executeDBCustom(
        runtime,
        TemplateSQL["select"][runtime.db.databaseType(dbName)],
        [count.toString(), start.toString(), filter],
        "usage",
    ).then(
        async (result: any) => {
            const records: IUsageDBRecord[] = [];
            if (Array.isArray(result) && result.length) {
                for (const item of result) {
                    records.push({
                        user: item["user"],
                        project: item["project"],
                        module: item["module"],
                        action: item["action"],
                        time: item["time"],
                        msg: item["msg"],
                    });
                }
            }

            return Promise.resolve({ start, records, end: start + count - 1 });
        },
        async (error) => Promise.reject(error),
    );
}

export {
    pushUsage as push,
    clearUsage as clear,
    selectUsageCount as count,
    selectUsageRecords as getUsages,
    searchUsageCount as getSearchCount,
    searchUsageRecords as getSearchUsages,
};
