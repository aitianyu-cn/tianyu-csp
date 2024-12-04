/** @format */

import { getBoolean, StringHelper } from "@aitianyu.cn/types";
import { IFeaturesConfig } from "../interface/FeatureMgr";
import { IRuntimeManager } from "../interface/RuntimeMgr";
import { selectDBCount, executeDBCustom, batchDBCustom } from "./CommonAccessor";
import { TemplateSQL } from "./sql/FeatureSql";
import { FilterHelper } from "../utils/FilterHelper";
import { RecordsResult } from "../interface/Declars";

async function selectFeatureIsActive(runtime: IRuntimeManager, name: string): Promise<boolean> {
    const { dbName } = runtime.db.mappingTable("feature");

    return executeDBCustom(runtime, TemplateSQL["isActive"][runtime.db.databaseType(dbName)], [name], "feature", true).then(
        async (result) => {
            const active = Array.isArray(result) && result.length ? getBoolean(result[0]["enable"]) : false;
            return Promise.resolve(active);
        },
        async (error) => Promise.reject(error),
    );
}

async function selectFeaturesCount(runtime: IRuntimeManager): Promise<number> {
    return searchFeaturesCount(runtime, FilterHelper.format(runtime));
}

async function selectAllFeatures(
    runtime: IRuntimeManager,
    start: number,
    count: number,
): RecordsResult<(IFeaturesConfig & { id: string })[]> {
    return searchFeatures(runtime, start, count, FilterHelper.format(runtime));
}

async function selectFeatureContains(runtime: IRuntimeManager, name: string): Promise<boolean> {
    const { dbName } = runtime.db.mappingTable("feature");

    return executeDBCustom(runtime, TemplateSQL["contains"][runtime.db.databaseType(dbName)], [name], "feature").then(
        async (result) => {
            const active = getBoolean(Array.isArray(result) && result.length);
            return Promise.resolve(active);
        },
        async (error) => Promise.reject(error),
    );
}

async function enableFeature(runtime: IRuntimeManager, features: string[]): Promise<void> {
    const { dbName, tableMapping } = runtime.db.mappingTable("feature");

    const sqls: string[] = [];
    for (const feature of features) {
        sqls.push(StringHelper.format(TemplateSQL["enable"][runtime.db.databaseType(dbName)], [dbName, tableMapping, feature]));
    }

    return batchDBCustom(runtime, sqls, "feature").then(
        async () => Promise.resolve(),
        async (error) => Promise.reject(error),
    );
}

async function disableFeature(runtime: IRuntimeManager, features: string[]): Promise<void> {
    const { dbName, tableMapping } = runtime.db.mappingTable("feature");

    const sqls: string[] = [];
    for (const feature of features) {
        sqls.push(StringHelper.format(TemplateSQL["disable"][runtime.db.databaseType(dbName)], [dbName, tableMapping, feature]));
    }

    return batchDBCustom(runtime, sqls, "feature").then(
        async () => Promise.resolve(),
        async (error) => Promise.reject(error),
    );
}

async function searchFeaturesCount(runtime: IRuntimeManager, filter: string): Promise<number> {
    return selectDBCount(runtime, "feature", filter);
}

async function searchFeatures(
    runtime: IRuntimeManager,
    start: number,
    count: number,
    filter: string,
): RecordsResult<(IFeaturesConfig & { id: string })[]> {
    const { dbName } = runtime.db.mappingTable("feature");

    return executeDBCustom(
        runtime,
        TemplateSQL["selectAll"][runtime.db.databaseType(dbName)],
        [count.toString(), start.toString(), filter],
        "feature",
    ).then(
        async (result: any) => {
            const records: (IFeaturesConfig & { id: string })[] = [];
            if (Array.isArray(result) && result.length) {
                for (const item of result) {
                    records.push({
                        id: item["id"],
                        enable: getBoolean(item["enable"]),
                        description: item["desc"],
                        dependency: item["deps"] ? (item["deps"] as string).split(",").map((value) => value.trim()) : [],
                    });
                }
            }

            return Promise.resolve({ records, start, end: start + count - 1 });
        },
        async (error) => Promise.reject(error),
    );
}

export {
    selectFeatureIsActive as isActive,
    selectFeaturesCount as count,
    selectAllFeatures as allFeatures,
    selectFeatureContains as contains,
    enableFeature as enable,
    disableFeature as disable,
    searchFeaturesCount as getSearchCount,
    searchFeatures as getSearchFeatures,
};
