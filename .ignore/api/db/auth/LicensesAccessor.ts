/** @format */

import { ILicensesDBRecord } from "#infra/api/interface/Authorize";
import { IRuntimeManager } from "#infra/api/interface/RuntimeMgr";
import { getBoolean } from "@aitianyu.cn/types";
import { selectDBCount, executeDBCustom } from "../CommonAccessor";
import { RecordsResult } from "#infra/api/interface/Declars";
import { FilterHelper } from "#infra/api/utils/FilterHelper";

const TemplateSQL: any = {
    allLicenses: {
        mysql: "SELECT `id`, `name`, `desc`, `sys` FROM `{0}`.`{1}` LIMIT {2} OFFSET {3} WHERE {4};",
    },
    addLicenses: {
        mysql: "INSERT INTO `{0}`.`{1}` (`id`, `name`, `desc`, `sys`) VALUES ('{2}', '{3}', '{4}', {5});",
    },
};

//==============================================================
// Licenses Part
//==============================================================

async function selectLicensesCount(runtime: IRuntimeManager): Promise<number> {
    return searchLicensesCount(
        runtime,
        FilterHelper.format(runtime, undefined, {
            bypassUser: true,
        }),
    );
}

async function selectAllLicenses(runtime: IRuntimeManager, start: number, count: number): RecordsResult<ILicensesDBRecord[]> {
    return searchLicenses(
        runtime,
        start,
        count,
        FilterHelper.format(runtime, undefined, {
            bypassUser: true,
        }),
    );
}

async function addLicenses(runtime: IRuntimeManager, record: ILicensesDBRecord): Promise<void> {
    const { dbName } = runtime.db.mappingTable("licenses");

    return executeDBCustom(
        runtime,
        TemplateSQL["addLicenses"][runtime.db.databaseType(dbName)],
        [record.id, record.name, record.desc, record.sys ? "1" : "0"],
        "licenses",
    ).then(
        async () => Promise.resolve(),
        async (error) => Promise.reject(error),
    );
}

async function searchLicensesCount(runtime: IRuntimeManager, filter: string): Promise<number> {
    return selectDBCount(runtime, "licenses", filter);
}

async function searchLicenses(
    runtime: IRuntimeManager,
    start: number,
    count: number,
    filter: string,
): RecordsResult<ILicensesDBRecord[]> {
    const { dbName } = runtime.db.mappingTable("licenses");

    return executeDBCustom(
        runtime,
        TemplateSQL["allLicenses"][runtime.db.databaseType(dbName)],
        [count.toString(), start.toString(), filter],
        "licenses",
    ).then(
        async (result: any) => {
            const records: ILicensesDBRecord[] = [];
            if (Array.isArray(result) && result.length) {
                for (const item of result) {
                    records.push({
                        id: item["id"],
                        name: item["name"],
                        desc: item["desc"],
                        sys: getBoolean(item["sys"]),
                    });
                }
            }

            return Promise.resolve({ records, start, end: start + count - 1 });
        },
        async (error) => Promise.reject(error),
    );
}

export {
    selectLicensesCount as count,
    selectAllLicenses as allLicenses,
    addLicenses as add,
    searchLicensesCount as getSearchCount,
    searchLicenses as getSearchLicenses,
};
