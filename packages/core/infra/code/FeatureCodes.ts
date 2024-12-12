/** @format */

import { SupportedDatabaseType } from "#interface";
import { getBoolean, MapOfBoolean, MapOfType, StringHelper } from "@aitianyu.cn/types";
import { DATABASE_SYS_DB_MAP } from "../../../Common";
import { DEFAULT_SYS_DB_MAP } from "../Constant";
import { IFeaturesConfig } from "#interface";

const IsActiveSql: { [key in SupportedDatabaseType]: string } = {
    mysql: "SELECT `{2}` as enable FROM `{0}`.`{1}` WHERE `{3}` = '{4}';",
};

export async function handleFeatureIsActive(feature: string): Promise<boolean> {
    const dbInfo = DATABASE_SYS_DB_MAP["feature"] || DEFAULT_SYS_DB_MAP["feature"];
    const sql = StringHelper.format(IsActiveSql[TIANYU.db.databaseType(dbInfo.database)], [
        dbInfo.database,
        dbInfo.table,

        dbInfo.field.enable,

        dbInfo.field.id,
        feature,
    ]);
    const connection = TIANYU.db.connect(dbInfo.database);
    const result = await connection.query(sql).catch((error) => {
        TIANYU.logger.error(JSON.stringify(error));
        return [];
    });

    if (Array.isArray(result) && result.length) {
        return getBoolean(result[0]["enable"]);
    }
    return false;
}

const GetCountSql: { [key in SupportedDatabaseType]: string } = {
    mysql: "SELECT COUNT(*) as counter FROM `{0}`.`{1}`;",
};

export async function handleFeatureGetCount(): Promise<number> {
    const dbInfo = DATABASE_SYS_DB_MAP["feature"] || DEFAULT_SYS_DB_MAP["feature"];
    const sql = StringHelper.format(GetCountSql[TIANYU.db.databaseType(dbInfo.database)], [dbInfo.database, dbInfo.table]);
    const connection = TIANYU.db.connect(dbInfo.database);
    const counter = await connection.query(sql).then(
        (result) => {
            if (Array.isArray(result) && result.length) {
                const count = Number(result[0]["counter"]);
                return Number.isNaN(count) ? 0 : count;
            }
            return 0;
        },
        (error) => {
            TIANYU.logger.error(JSON.stringify(error));
            return 0;
        },
    );
    return counter;
}

const GetFeatureListSql: { [key in SupportedDatabaseType]: string } = {
    mysql: "SELECT `{4}` as id, `{5}` as enable, `{6}` as desc, `{7}` as deps FROM `{0}`.`{1}` LIMIT {2} OFFSET {3};",
};

export async function handleFeatureGetFeatures(start: number, count: number): Promise<MapOfType<IFeaturesConfig>> {
    const dbInfo = DATABASE_SYS_DB_MAP["feature"] || DEFAULT_SYS_DB_MAP["feature"];
    const sql = StringHelper.format(GetFeatureListSql[TIANYU.db.databaseType(dbInfo.database)], [
        dbInfo.database,
        dbInfo.table,

        count.toString(),
        start.toString(),

        dbInfo.field.id,
        dbInfo.field.enable,
        dbInfo.field.desc,
        dbInfo.field.deps,
    ]);
    const connection = TIANYU.db.connect(dbInfo.database);
    const result = await connection.query(sql).catch((error) => {
        TIANYU.logger.error(JSON.stringify(error));
        return [];
    });

    const returnValue: MapOfType<IFeaturesConfig> = {};
    if (Array.isArray(result) && result.length) {
        for (const item of result) {
            const key = item["id"] || "";
            const enable = getBoolean(item["enable"]);
            const desc = item["desc"] || "";
            const deps = ((item["deps"] || "") as string).split(",").filter((dep_item) => !!dep_item);

            if (key) {
                returnValue[key] = { enable, description: desc, dependency: deps };
            }
        }
    }
    return returnValue;
}

const EnableOrDisableFeatureSql: { [key in SupportedDatabaseType]: string } = {
    mysql: "UPDATE `{0}`.`{1}` SET `{4}` = {5} WHERE `{2}` = '{3}';",
};

export async function handleFeatureStateChange(changes: MapOfBoolean): Promise<void> {
    const dbInfo = DATABASE_SYS_DB_MAP["feature"] || DEFAULT_SYS_DB_MAP["feature"];
    const template = EnableOrDisableFeatureSql[TIANYU.db.databaseType(dbInfo.database)];
    const sqls: string[] = [];
    for (const key of Object.keys(changes)) {
        const status = changes[key];
        sqls.push(
            StringHelper.format(template, [
                dbInfo.database,
                dbInfo.table,

                dbInfo.field.id,
                key,

                dbInfo.field.enable,
                status ? 1 : 0,
            ]),
        );
    }

    const connection = TIANYU.db.connect(dbInfo.database);
    await connection.executeBatch(sqls).catch((error) => {
        TIANYU.logger.error(JSON.stringify(error));
        return [];
    });
}

const SearchFeatureSql: { [key in SupportedDatabaseType]: string } = {
    mysql: "SELECT `{3}` as id, `{4}` as enable, `{5}` as desc, `{6}` as deps FROM `{0}`.`{1}` WHERE `{3}` like '%{7}%' LIMIT 50 OFFSET {2};",
};

export async function handleFeatureSearchFeatures(search: string, start: number): Promise<MapOfType<IFeaturesConfig>> {
    const dbInfo = DATABASE_SYS_DB_MAP["feature"] || DEFAULT_SYS_DB_MAP["feature"];
    const sql = StringHelper.format(SearchFeatureSql[TIANYU.db.databaseType(dbInfo.database)], [
        dbInfo.database,
        dbInfo.table,

        start.toString(),

        dbInfo.field.id,
        dbInfo.field.enable,
        dbInfo.field.desc,
        dbInfo.field.deps,

        search,
    ]);
    const connection = TIANYU.db.connect(dbInfo.database);
    const result = await connection.query(sql).catch((error) => {
        TIANYU.logger.error(JSON.stringify(error));
        return [];
    });

    const returnValue: MapOfType<IFeaturesConfig> = {};
    if (Array.isArray(result) && result.length) {
        for (const item of result) {
            const key = item["id"] || "";
            const enable = getBoolean(item["enable"]);
            const desc = item["desc"] || "";
            const deps = ((item["deps"] || "") as string).split(",").filter((dep_item) => !!dep_item);

            if (key) {
                returnValue[key] = { enable, description: desc, dependency: deps };
            }
        }
    }
    return returnValue;
}
