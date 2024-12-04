/** @format */

import { getBoolean } from "@aitianyu.cn/types";
import { IFeaturesConfig } from "../interface/FeatureMgr";
import { IRuntimeManager } from "../interface/RuntimeMgr";
import { selectDBCount, executeDBCustom, selectDBRecords } from "./CommonAccessor";
import { TemplateSQL } from "./sql/FeatureSql";

export async function selectFeatureIsActive(runtime: IRuntimeManager, name: string): Promise<boolean> {
    const { dbName } = runtime.db.mappingTable("feature");

    return executeDBCustom(runtime, TemplateSQL["isActive"][runtime.db.databaseType(dbName)], [name], "feature", true).then(
        async (result) => {
            const active = Array.isArray(result) && result.length ? getBoolean(result[0]["enable"]) : false;
            return Promise.resolve(active);
        },
        async (error) => Promise.reject(error),
    );
}

export async function selectFeaturesCount(runtime: IRuntimeManager): Promise<number> {
    return selectDBCount(runtime, "feature");
}

export async function selectAllFeatures(
    runtime: IRuntimeManager,
    start: number,
    count: number,
): Promise<(IFeaturesConfig & { id: string })[]> {
    const { dbName } = runtime.db.mappingTable("feature");

    return selectDBRecords(runtime, TemplateSQL["selectAll"][runtime.db.databaseType(dbName)], start, count, "feature").then(
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

            return Promise.resolve(records);
        },
        async (error) => Promise.reject(error),
    );
}

export async function selectFeatureContains(runtime: IRuntimeManager, name: string): Promise<boolean> {
    const { dbName } = runtime.db.mappingTable("feature");

    return executeDBCustom(runtime, TemplateSQL["contains"][runtime.db.databaseType(dbName)], [name], "feature").then(
        async (result) => {
            const active = getBoolean(Array.isArray(result) && result.length);
            return Promise.resolve(active);
        },
        async (error) => Promise.reject(error),
    );
}

export async function enableFeature(runtime: IRuntimeManager, name: string): Promise<void> {
    const { dbName } = runtime.db.mappingTable("feature");

    return executeDBCustom(runtime, TemplateSQL["enable"][runtime.db.databaseType(dbName)], [name], "feature").then(
        async () => Promise.resolve(),
        async (error) => Promise.reject(error),
    );
}

export async function disableFeature(runtime: IRuntimeManager, name: string): Promise<void> {
    const { dbName } = runtime.db.mappingTable("feature");

    return executeDBCustom(runtime, TemplateSQL["disable"][runtime.db.databaseType(dbName)], [name], "feature").then(
        async () => Promise.resolve(),
        async (error) => Promise.reject(error),
    );
}
