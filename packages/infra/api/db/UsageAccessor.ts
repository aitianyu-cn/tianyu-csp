/** @format */

import { OperationActions } from "../interface/Declars";
import { LogHelper } from "../utils/LogHelper";
import { TemplateSQL } from "./sql/UsageSql";
import { IRuntimeManager } from "../interface/RuntimeMgr";
import { IUsageDBRecord } from "../interface/Usage";
import { clearDBTable, pushDBRecord, selectDBCount, selectDBRecords } from "./CommonAccessor";

export async function pushUsage(
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

export async function selectUsageCount(runtime: IRuntimeManager): Promise<number> {
    return selectDBCount(runtime, "usage");
}

export async function selectUsageRecords(runtime: IRuntimeManager, start: number, count: number): Promise<IUsageDBRecord[]> {
    const { dbName } = runtime.db.mappingTable("usage");

    return selectDBRecords(runtime, TemplateSQL["select"][runtime.db.databaseType(dbName)], start, count, "usage").then(
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

            return Promise.resolve(records);
        },
        async (error) => Promise.reject(error),
    );
}

export async function clearUsage(runtime: IRuntimeManager): Promise<void> {
    return clearDBTable(runtime, "usage");
}
